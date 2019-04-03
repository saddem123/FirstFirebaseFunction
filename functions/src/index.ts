import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

admin.initializeApp()

export const onBostonWeatherUpdate = 
functions.firestore.document("cities-weather/boston-ma-us").onUpdate(change => {
    const after:any = change.after.data()
    const playload = {
        data: {
            temp: String(after.temp),
            conditions: after.conditions
        }
    }
    return admin.messaging().sendToTopic("weather_boston-ma-us", playload)
    
})
export const getBostonAreaWeather = 
functions.https.onRequest((request ,response) => {
    admin.firestore().doc("areas/greater-boston").get()
    .then(areaSnapshot => {
        const cities = areaSnapshot.data().cities
        const promises = []
        for(const city in cities) {
           const p =  admin.firestore().doc(`cities-weather/${city}`).get()
           promises.push(p)     
        }
        return  Promise.all(promises)
    })
    .then(citySnapshot => {
        const results = []
        citySnapshot.forEach(citySnap => {
            const data = citySnap.data()
            results.push(data)
        })
        response.send(results)
    })
    .catch(error => {
        console.log(error)
        response.status(500).send(error)
    })
})



export const getBostonWeather = functions.https.onRequest((request, response) => {
    const promise  =  admin.firestore().doc('cities-weather/boston-ma-us').get()
    const p2 = promise.then(snapshot => {
        const data = snapshot.data()
        response.send(data)
   });
   p2.catch(error => {
        //Handle the error 
        console.log(error)
        response.status(500).send(error)
   });
   
});
