module.exports.randomPropety = (obj) => {
    var keys = Object.keys(obj);
    let random = keys.length * Math.random() << 0
    return {
        key: keys[random],
        value: obj[keys[random]]
    }
}
module.exports.questionTopic = (key) => {
    let question = ''
    if (key == 'pet_name')
        question = "What is your pet's name?"
    if (key == 'fav_food')
        question = "What is your favourite food?"
    if (key == 'nickname')
        question = "What is your young nickname?"
    return question
}