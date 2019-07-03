import { of } from 'rxjs';

export class Configuration {
  constructor(accessConfiguration) {

  }
  get(accessKey) {

  }
}

const humanConfiguration = {
  Main: {
    UserForm: {
      FirstName: {
        Read: 'CanRead & CanWrite',
        Write: 'CanWrite'
      },
      Login: {
        Read: 'CanRead | CanWrite',
      }
    }
  },
  ProfileForm: {
    Write: 'CanUpdateAll'
  },
  Export: 'CanExport'
}

const steps = {

  "Main.UserForm.FirstName:Read": "CanRead & CanWrite", // without SE
  "Main.UserForm.FirstName:Write": "CanWrite",// without SE
  "Main.UserForm.Login:Read": "CanRead | CanWrite",// without SE

  "Main.UserForm:Read": ["Main.UserForm.FirstName:Read", "Main.UserForm.Login:Read"],
  "Main.UserForm:Write": ["Main.UserForm.FirstName:Write"],

  "Main:Write": ["Main.UserForm:Write"],
  "Main:Read": ["Main.UserForm:Read"]
}

const groupConfiguration = {
  Read: {
    Main: {
      UserForm: {
        FirstName: 'CanRead & CanWrite',
        Login: 'CanRead | CanWrite',
      }
    }
  },
  Write: {
    Main: {
      UserForm: {
        FirstName: 'CanWrite',
      }
    },
    ProfileForm: "CanUpdateAll"
  },
  Export: 'CanExport'
}

function or(...keys) {

}

function wrapInSubjects(canAccess$) {

}

function canExpression(expression) {

}

function canAccess(key) {
  reactiveConfiguration[key].output.subscribe();
}

function updateExpression(key, expression) {
  reactiveConfiguration[key].input.next(expression); // Removes previous subscription, creates new canExpression emits value into output
}

// Parse groupConfiguration to prepare reactive one.
const reactiveConfiguration = {
  'Main.UserForm.FirstName:Read': wrapInSubjects(canExpression('CanRead & CanWrite')),
  'Main.UserForm.Login:Read': wrapInSubjects(canExpression('CanRead | CanWrite')),
  "Main.UserForm:Read": or('Main.UserForm.FirstName:Read', 'Main.UserForm.Login:Read'),
  "Main:Read": or('Main.UserForm:Read', 'Main.UserForm:Read'),
  'Main.UserForm.FirstName:Write': wrapInSubjects(canExpression('CanWrite')),
  'Main.UserForm:Write': or('Main.UserForm.FirstName:Write'),
  "Main:Write": or('Main.UserForm:Write'),
  "ProfileForm:Write": wrapInSubjects(canExpression('CanUpdateAll')),
  "Read": or("Main:Read"),
  "Write": or("Main:Write", "ProfileForm:Read"),
  "Export": wrapInSubjects(canExpression('CanExport'))
}
