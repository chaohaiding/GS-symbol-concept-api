const {
  promisify
} = require('util');
const cheerio = require('cheerio');
const axios = require('axios')
const validator = require('validator');
const jsonld = require('jsonld');
const CONCEPTNET_API = process.env.CONCEPTNET_API;
const Tag = require('../models/Tag');

const waitFor = (ms) => new Promise(r => setTimeout(r, ms));
/**
 * GET /api
 * List of API examples.
 */
exports.getApi = (req, res) => {
  res.render('api/index', {
    title: 'API Examples'
  });
};


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


/**
 * GET /api/query?concept=xxx&limit=xxx&excluding=xxx,xxx,xxx&symbol_set=xxx
 * @param concept:xxx, limit:xxx, excluding:['xx','xx'], symbol_set=xxx, popularity=xxx
 * @return Get list of concept tags and return json object.
 */
exports.query = (req, res) => {
  //concet needs to be not null
  if (req.query.concept && req.query.symbol_set) {
    let concept = req.query.concept;
    let symbol_set = req.query.symbol_set;
    let popularity = req.query.popularity || 1;
    let exclude = req.query.exclude != null ? req.query.exclude.split(',') : [];
    let _limit = req.query.limit || 3; //default 3
    let limit = parseInt(_limit) + exclude.length;
    //http://api.conceptnet.io/query?node=/c/en/dog&rel=/r/IsA&limit=20&start=/c/en/dog
    axios({
      url: '/query',
      method: 'get', // default
      baseURL: CONCEPTNET_API,
      params: {
        node: concept,
        rel: '/r/IsA',
        limit: limit,
        start: concept
      }
    }).then((response) => {
      // 1.validate edges length from the response data
      let data = response.data;
      let edges = data['edges'];
      let recommend_tags = [];
      if (edges.length > 0) {
        (async () => {
          await asyncForEach(edges, async (item) => {
            let recommend_tag = {};
            let end = item['end'];
            if (!exclude.includes(end['term'])) {
              //recommend_tag['surfaceText'] = item['surfaceText'];
              recommend_tag['weight'] = item['weight'];
              recommend_tag['label'] = end['label'];
              recommend_tag['concept'] = end['term'];
              recommend_tag['lang'] = end['language'];
              let start = Date.now();
              //http://api.conceptnet.io/c/en/pet?limit=1000
              //Default to Maximum: 1000 (or 200 to save time)
              await axios({
                url: end['term'],
                method: 'get',
                baseURL: CONCEPTNET_API,
                params: {
                  limit: 1000
                }
              }).then((response) => {
                //console.log(response.data);
                //burst query ConceptNet API: 3600 requests per hour to the ConceptNet API
                let end = Date.now() - start - 500;
                waitFor(0 - end);
                let _popularity = response.data.edges.length;
                if (_popularity >= popularity) {
                  recommend_tag['popularity'] = _popularity;
                  recommend_tags.push(recommend_tag);
                }
              }).catch((err) => {
                console.log(err);
              });
            }
          });
          res.send({
            status: 200,
            data: recommend_tags.slice(0, _limit)
          });
        })();
      } else {
        res.send({
          status: 200,
          data: recommend_tags
        });
      }
    });

  } else {
    res.send({
      status: 400,
      message: 'Missing fileds: concept or symbol_set!'
    });
  }
};


/*
 *setQuery for symbol set
 * example: post /api/symbolset/query  data:{symbol_set:xxx, limit:xx, symbol_concepts:xx,xx,xx..,xx}
 */
exports.setQuery = (req, res) => {
  if (req.body && req.body.symbol_concepts && req.body.symbol_set) {
    let symbol_concepts = req.body.symbol_concepts.split(',');

    let symbol_set = req.body.symbol_set;
    let limit = req.body.limit || 3;
    if (symbol_concepts.length > 0) {
      (async () => {
        let result = [];
        await asyncForEach(symbol_concepts, async (symbol_concept) => {
          //request the ConceptNet API to get IsA related concepts
          let concept_entity = {};
          symbol_concept = symbol_concept.trim();
          concept_entity['concept'] = symbol_concept;
          try {
            let recommend_tags = [];
            let response = await axios({
              url: '/query',
              method: 'get',
              baseURL: CONCEPTNET_API,
              params: {
                node: symbol_concept,
                rel: '/r/IsA',
                limit: limit,
                start: symbol_concept
              }
            });
            let edges = response.data['edges'];
            if (edges.length > 0) {
              await asyncForEach(edges, async (edge) => {
                let recommend_tag = {};
                let end = edge['end'];
                recommend_tag['weight'] = edge['weight'];
                recommend_tag['label'] = end['label'];
                recommend_tag['concept'] = end['term'];
                recommend_tag['lang'] = end['language'];
                let start_time = Date.now();
                let _response = await axios({
                  url: end['term'],
                  method: 'get',
                  baseURL: CONCEPTNET_API,
                  params: {
                    limit: 1000
                  }
                });
                let end_time = Date.now() - start_time - 500;
                waitFor(0 - end_time);
                recommend_tag['popularity'] = _response.data.edges.length;
                recommend_tags.push(recommend_tag);
              });
              concept_entity['recommend_tags'] = recommend_tags;
            }
            result.push(concept_entity);
          } catch (error) {
            console.log(error);
          }
        });
        res.send({
          status: 200,
          data: result
        });
      })();
    } else {
      res.send({
        status: 400,
        message: 'symbol_set is empty!'
      });
    }
  } else {
    res.send({
      status: 400,
      message: 'Missing fileds: symbol_concepts or symbol_set!'
    });
  }
};