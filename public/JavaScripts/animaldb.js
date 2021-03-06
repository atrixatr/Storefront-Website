/********************************************************************
 * animaldb.js
 *  
 * author: Zachary Colbert (921899547)
 * purpose: Implement functions for storing and retrieving animal
 *          records from the database.
 ********************************************************************/


import { Animal } from "./animal.js";

/**
 * Construct an Animal object from a JSON structure 
 * 
 * @param key The unique string identifier for this animal
 * @param animal_JSON A JSON structure containing the animal's data
 * @returns A fully initialized Animal object containing data from the JSON structure
 */
function animalFromJSON(key, animal_JSON)
{
    var animal = new Animal(animal_JSON.name, animal_JSON.kingdom);
    animal.key = key;
    animal.description = animal_JSON.description;
    animal.price = animal_JSON.price;
    animal.attributes = animal_JSON.attributes;
    animal.images = animal_JSON.images;
    animal.size = animal_JSON.size;
    animal.venomous = Boolean(animal_JSON.venomous);
    animal.bloodtemp = animal_JSON.blood_temp;

    return animal;
}


/**
 * Construct an Animal object from a database row returned from a query 
 * 
 * @param record The record returned from a successful query
 * @returns A fully initialized Animal object populated with the row's data
 */
function _animalFromRecord(record) 
{
    let animal = new Animal(record.name, record.kingdom);
    animal.key = record.keyword;
    animal.description = record.description;
    animal.price = record.price;
    animal.size = record.size;
    animal.bloodtemp = record.blood_temp;
    animal.venomous = Boolean(record.venomous);
    animal.images[0] = record.image1;
    animal.images[1] = record.image2;
    animal.images[2] = record.image3;
    animal.images[3] = record.image4;
    animal.images[4] = record.image5;
    return animal;
}


/**
 * Construct an Array of Animals from a set of query rows
 * 
 * @param records A set of rows returned from a query
 * @returns An Array of Animals containing the data of each respective row
 */
function _animalsFromRecordSet(records)
{
    let animals = new Array();
    for (var r of records) {
        animals.push(_animalFromRecord(r));
    }
    return animals;
}


/**
 * Locate an animal by a unique key and execute the callback
 * function on an Animal constructed from the resulting row. 
 * 
 * @param con A mysql database connection object
 * @param key A unique string identifier for the animal
 * @param callback Executed using query result as input
 */
export function readAnimalByKey(con, key, callback)
{
    let sql = "SELECT * FROM animal WHERE keyword=(?);";
    con.query(sql, key, function(err, result) {
        if (err) throw err;
        callback(_animalFromRecord(result[0]));
    });
}


/**
 * Retrieve all animals in the given kingdom 
 * 
 * @param con A mysql database connection object
 * @param kingdom The animal kingdom to search within
 * @param callback Executes using query results as input
 */
export function readAnimalsByKingdom(con, kingdom, callback) 
{
    let sql = "SELECT * FROM animal WHERE kingdom=(?);";
    con.query(sql, kingdom, function(err, result) {
        if (err) throw err;
        callback(_animalsFromRecordSet(result));
    });
}


/**
 * Retrieve an Array of Animals matching the given search
 * term in any of its relevant data fields, and execute the
 * given callback function on the results. 
 * 
 * @param con A mysql database connection object
 * @param term The keyword to search for
 * @param callback Executes using query results as input
 */
export function readAnimalsBySearchTerm(con, terms, callback)
{
    // escape search term to prevent SQL injection during concatenation
    let sql = "SELECT * FROM animal WHERE";

    // Construct a conditional statement
    // consisting of each search term
    var count = 0;
    for (var t of terms) {
        if (count++ > 0) sql += " OR";
        sql += "(";
        let wildcard = con.escape('%' + t + '%');

        sql += " description LIKE " + wildcard 
        sql += " OR name LIKE" + wildcard 
        sql += " OR size LIKE" + wildcard 
        sql += " OR kingdom LIKE" + wildcard 
        sql += " OR size LIKE" + wildcard
        sql += " OR blood_temp LIKE" + wildcard;
        sql += ")";
    
    }
    sql += ";";

    con.query(sql, function(err, result) {
        if (err) throw err;
        callback(_animalsFromRecordSet(result));
    });
}


/**
 * Retrieve all animal records from the database 
 * and pass an Array of fully constructed Animal 
 * objects to the given callback function.
 * 
 * @param con A mysql database connection object
 * @param callback Executes using query results as input
 */
export function readAllAnimals(con, callback)
{
    let sql = "SELECT * FROM animal;";
    con.query(sql, function(err, result) {
        if (err) throw err;
        callback(_animalsFromRecordSet(result));
    });
}


/**
 * 
 * @param con A mysql database connection object
 * @param keys An Array of unique string identifiers for each animal
 * @param callback Executes using query results as input
 */
export function readAnimalsFromArrayOfKeys(con, keys, callback)
{
    let sql = "SELECT * FROM animal WHERE";

    // Construct query parameter from each key
    let count = 0;
    for (var k of keys) {
        if (count++ > 0) {
            sql += " OR";
        }
        sql += " keyword='" + k + "'";
    }
    con.query(sql, function(err, result) {
        if (err) throw err;
        callback(_animalsFromRecordSet(result));
    });
}


/**
 * Insert a new Animal record into the database 
 * 
 * @param con A mysql database connection object
 * @param key The unique string identifier for this Animal
 * @param animal_JSON A JSON structure containing the animal's data
 */
export function insertAnimalFromJSON(con, key, animal_JSON)
{
    let animal = animalFromJSON(key, animal_JSON);

    let sql = "INSERT INTO animal ( \
                    keyword,        \
                    name,           \
                    kingdom,        \
                    description,    \
                    price,          \
                    size,           \
                    blood_temp,     \
                    venomous,       \
                    image1,         \
                    image2,         \
                    image3,         \
                    image4,         \
                    image5)         \
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"         

    var values = [
        key, 
        animal.name, 
        animal.kingdom, 
        animal.description, 
        animal.price, 
        animal.size,
        animal.bloodtemp,
        animal.venomous,
        animal.images[0],
        animal.images[1],
        animal.images[2],
        animal.images[3],
        animal.images[4]
    ];

    con.query(sql, values, function(err, result) {
        if (err) throw err;
    });
}