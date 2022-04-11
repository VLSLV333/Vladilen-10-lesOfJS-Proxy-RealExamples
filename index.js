// Wrapper
                            // буде задавати дефолтне значення ключів, якщо вони у нас не визначені
                            
const withDefaultValue = (target, defaultValue = 0) => {
   return new Proxy(target, {
       get: (obj, prop) => (prop in obj) ? obj[prop] : defaultValue
   }) 
}

                                    // за допомогою цього проксі ми створили новий об'єкт - position. Звертаючись до його ключів, ми отримуємо значення, які ми задали власноруч, звертаючись до будь-якого іншого ключа - отримуємо значення, яке ми задаємо defaultValue
const position = withDefaultValue(
    {
    x: 24,
    y: 42
    },
    33
)

// Hidden Properties     - проксі за допомогою якого ми можемо створити об'єкт до певних ключів котрого немає доступу.

const withHiddenProps = (target, prefix = "_") => {
    return new Proxy(target, {
        has: (obj, prop) => (prop in obj) && (!prop.startsWith(prefix)),
        ownKeys: obj => Reflect.ownKeys(obj)
            .filter(p => !p.startsWith(prefix)),
        get: (obj, prop, receiver) => (prop in receiver ? obj[prop] : void 0) // void 0 = код поверне undefined
    })
}

const data = withHiddenProps({
    name: "Vladislav",
    age: 25,
    _userID: "100 000 IQ"
})

// data._userID = undefined; "_userID" in data = false (думаю це has), for (let key in data) console.log(data[key]) = тільки ключі без _ доступні, Object.keys(data) = тільки ключі без _ доступні


// Optimization
// const userData = [
//     {id: 1, name: "Vlad", job: "programing", age: 25},
//     {id: 2, name: "Julia", job: "content manager", age: 20},
//     {id: 3, name: "Nastia", job: "student", age: 18},
//     {id: 4, name: "Sasha", job: "business", age: 45}
// ]

// for (let i = 0; i < userData.length; i++){
//      if (userData[i].id === 2){
//         console.log(userData[i]);
//      }
// }

// userData.find(user => user.id === 3) // у кожній ітерації еррея знаходить об'єкти, які задовільняють наш пошук

                                        // Обидва ці методи під час пошуку проходяться по кожній ітерації, якщо у нас буде умовно 10к об'єктів, то це буде затратно по часу і потужностям. Тому ми зараз оптимізуємо цей процес пошуку об'єкту за айді за допомогою проксі

// const index = {}                           // forEach = метод проходиться по кожній ітерації userData
// userData.forEach(i => (index[i.id] = i))  // створюємо об'єкт в якому задано ключем кожної ітерації значення id, а велью кожного ключа це сама ітерація

// index[3]                                // тепер цей об'єкт показує відразу потрібний нам об'єкт по айді!


const IndexedArray = new Proxy(Array, {
    construct(target, [args]) {        // construct = робить пастку на ключове слово New; args = масив який передається в ключове слово new
        const index = {}
        args.forEach(item => (index[item.id] = item))

        return new Proxy(target(...args), {
            get(arr, prop){
                switch (prop) {
                    case "push": return item => {
                        index[item.id] = item
                        arr["push"].call(arr,item)
                    }
                    case "findById": return id => index[id]
                    default: return arr[prop]
                }
            }
        })
    }
})

const users = new IndexedArray([
    {id: 1, name: "Vlad", job: "programing", age: 25},
    {id: 2, name: "Julia", job: "content manager", age: 20},
    {id: 3, name: "Nastia", job: "student", age: 18},
    {id: 4, name: "Sasha", job: "business", age: 45}
])