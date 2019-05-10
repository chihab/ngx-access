## Usage in templates

### Check if user has access

```
<button *appHasAccess="'Path.To.Config:action'">
    <span>Modifier</span>
</button>

```

`Path.To.Config:action` is the path to access configuration (see below)

### Else statement

```
<ng-template [appHasAccess]="'Path.To.Config:action'; else anotherBlock">
  <span>Modifier</span>
</ng-template>

<ng-template #anotherBlock>
  <span>Autre message</span>
</ng-template>

```

### Group indicator

```
<button *appHasAccess="'Path.To.Config:action; group = true'">
    <span>Modifier</span>
</button>
```

**group**: whether parent access depends on children accesses. Default is false.

## Usage in code
```
  import { AccessHelper } from '../../auth/helpers';
  
  ...
  hasMetaDataWriteAccess() {
    return AccessHelper.can('Path.To.Configuration', 'action');
  }
  
```

## Configuration

**application.json**

```
{
  "permissions": {
    "Path": {
      "To" : {
        "View1" : [
          "Access1", "Access1bis"
        ],
        "View2" : "Access2",
        "View3" : {
          "operator": false,
          "list": ["Access3", "Access4"]
        }
     }
  }
}
``` 

| type  |  description | evaluation  |
|---|---|---|
|  string |  "Access1" |  true if user  has Access1 |
|  object |  {operator: "AND", list: \["Access1", "Access2"]} |  true if user has Access1 **AND** Access2. Possible values for operator: AND, OR |
|  array |  \["Access1", \["Access1", "Access2"]]  |  true if user has Access1 **OR** (Access2 **OR** Access3) |


### Combination of types

```
{
  "permissions": {
    "Path": {
      "To" : {
        combination: {
          operator: 'OR',
          list: [
            {operator: 'OR', list: ['Access1', 'Access2']},
            {
              operator: 'OR', list: [
                'Access3',
                'Access4',
                {operator: 'AND', list: ['Access5', 'Access6']},
              ]
            },
          ]
        }
      }
    }
  }
}
``` 

`AccessHelper.can('Path.To', 'combination')` would be true if user has 
 - (Access1 **OR** Access2)
 - **OR** Access3 
 - **OR** Access4) 
 - **OR** (Access5 **AND** Access6)

