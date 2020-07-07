# Global Symbol Concept Tagging API


## Installation
* install docker&docker-compose
* git clone https://github.com/chaohaiding/GS-symbol-concept-api.git
* cd GS-symbol-concept-api & cd gs_api
* docker-compose build
* docker-compose up

## API Introduction
There are two different queries regarding the concept tagging.

* Single concept query
* Bulk query with whole symbol set


### Single concept query

```javascript
HTTP GET baseURL/api/symbol/query with query parameters.
```
For example: baseURL/api/symbol/query?concept=/c/en/dog&symbol_set=arasaac&limit=4&exclude=/c/en/canine,/c/en/loyal_friend

##### parameters:
**concept**: query parameter, the concept of the symbol, e.g. /c/en/god
**symbol_set**: query parameter, the symbol set of the symbol belongs, e.g. arasaac
**limit**: query parameter, the limited number of the tags returned excluding the number of tags in the exclude parameter
**exclude**:  query parameter, list of symbol concepts joined with comma, exclude the tags, e.g. exclude=/c/en/canine, the returned tag list will not include any tag in the exclude list.


Return JSON object schame:{'status':200, data:[]},
Query Example: baseURL/api/symbol/query?concept=/c/en/dog&symbol_set=arasaac&limit=4&exclude=/c/en/canine,/c/en/loyal_friend.
Return Example:
```javascript
{"status":200,"data":[{"weight":6,"label":"pet","concept":"/c/en/pet","lang":"en","popularity":697},{"weight":5.291502622129181,"label":"mammal","concept":"/c/en/mammal","lang":"en","popularity":1000},{"weight":3.4641016151377544,"label":"a good friend","concept":"/c/en/good_friend","lang":"en","popularity":8},{"weight":2.82842712474619,"label":"a four legged animal","concept":"/c/en/four_legged_animal","lang":"en","popularity":3}]}
```
**Tag object**  includes weight: number, label: text label of the tag, concept: concept of the tag, lang: language, popularity: the length of edges this concept contains, which means how many other concepts linked to this tag. Popularity has been set to maximum 1000 at the moment (It is still a little bit slow).


###  Bulk query

```javascript
  HTTP POST baseURL/api/symbolset/query with body data parameters: {symbol_set: xxx, limit:xxx, symbol_concepts:xx,xx,xx}
```
##### parameters:
**symbol_set** is the name of target symbol set
**limit** is the limited number of tags return for each symbol concept
**symbol_concepts** is the list of symbol concepts joined with comma, for example symbol_concepts: /c/en/dog,/c/en/cat...
Return JSON object schame:
```javascript
  {'status':200, data:[tag_object,tag_object]}.
```
tag_object schema:  

```javascript
  { "concept": "/c/en/xx", "recommend_tags": [ { "weight": 1, "label": "xxx", "concept": "/c/en/xxxx", "lang": "en", "popularity": 1}
```


Query Example:
```javascript
Post  baseURL/api/symbolset/query with body data {symbol_set: 'arasaac', limit:5, symbol_concepts:/c/en/dog,/c/en/cat}
```

Return Example:
```javascript
 { "status": 200, "data": [ { "concept": "/c/en/dog", "recommend_tags": [ { "weight": 6.6332495807108, "label": "a loyal friend", "concept": "/c/en/loyal_friend", "lang": "en", "popularity": 1 }, { "weight": 6, "label": "pet", "concept": "/c/en/pet", "lang": "en", "popularity": 697 }, { "weight": 5.291502622129181, "label": "mammal", "concept": "/c/en/mammal", "lang": "en", "popularity": 1000 }, { "weight": 4.898979485566356, "label": "a canine", "concept": "/c/en/canine", "lang": "en", "popularity": 338 }, { "weight": 3.4641016151377544, "label": "a good friend", "concept": "/c/en/good_friend", "lang": "en", "popularity": 8 } ] }, { "concept": "/c/en/cat", "recommend_tags": [ { "weight": 2, "label": "woman", "concept": "/c/en/woman", "lang": "en", "popularity": 1000 }, { "weight": 2, "label": "gossip", "concept": "/c/en/gossip", "lang": "en", "popularity": 856 }, { "weight": 2, "label": "feline", "concept": "/c/en/feline", "lang": "en", "popularity": 246 }, { "weight": 1, "label": "Animal", "concept": "/c/en/animal", "lang": "en", "popularity": 1000 }, { "weight": 1, "label": "Talisman", "concept": "/c/en/talisman", "lang": "en", "popularity": 222 } ] } ] }
```
**Tag object** includes weight: number, label: text label of the tag, concept: concept of the tag, lang: language, popularity: the length of edges this concept contains, which means how many other concepts linked to this tag. Popularity has been set to maximum 1000 at the moment (It is still a little bit slow).
