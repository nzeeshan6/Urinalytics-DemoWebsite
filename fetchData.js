async function getName(sql, database_name, credentials, email){
    return new Promise((resolve, reject)=>{
        sql.query(`SELECT ${credentials.personName} FROM ${database_name}.${credentials.tableName} 
        WHERE ${credentials.email} ='${email}';`,(err, result)=>{
            if (err){
                throw err;
            }
            else {
                const name = Object.values(result[0])[0];

                console.log('Welcome:: '+name);
                resolve(name);
            }
        })
    })
}

async function getVitals(sql, database_name, vitals, email){
    return new Promise((resolve, reject)=>{
        sql.query(`SELECT ROW_NUMBER() OVER (ORDER BY ${vitals.date} DESC, ${vitals.time} DESC) AS id,
        ${vitals.date} as pushdate, 
        ${vitals.time} as pushtime, 
        ${vitals.location} as location, 
        ${vitals.ph} as ph, 
        ${vitals.gravity} as gravity, 
        ${vitals.sodium} as sodium, 
        ${vitals.uricAcid} as uric, 
        ${vitals.tds} as tds,
        ${vitals.albumin} as albumin 
        FROM ${database_name}.${vitals.tableName} WHERE 
        ${vitals.email} = '${email}';`, (err, result)=>{
            if (err) {
                throw err;
            }
            else{
                // console.log(result);
                // console.log(Object.values(result[0])[1].getDate());
                // console.log(Object.values(result[0])[1].getMonth()+1);
                // console.log(Object.values(result[0])[1].getFullYear());

                result.forEach(element => {
                    let temp = element.pushdate;
                    let date = `0${temp.getDate()}`;
                    let month = `0${temp.getMonth() + 1}`
                    let year = `${temp.getFullYear()}`;

                    // console.log(date , month, year);
                    element.pushdate = date.slice(-2) +'-' + month.slice(-2) +'-'+ year;
                });

                console.log('Printing Again');
                // console.log(result);
                resolve(result);
            }
        })
    })
}

function updateRecord(sql, database_name, vitals, particleID, jsonData){
    sql.query(`INSERT INTO ${database_name}.${vitals.tableName} (${vitals.id}, ${vitals.date}, ${vitals.time},
              ${vitals.particleID}, ${vitals.location}, ${vitals.ph}, ${vitals.gravity}, ${vitals.sodium}, 
              ${vitals.uricAcid}, ${vitals.tds}, ${vitals.albumin}) 
              VALUES ('${jsonData.uid}', '${jsonData.date}', '${jsonData.time}', '${particleID}', 
              '${jsonData.location}', '${jsonData.ph.toString()}', '${jsonData.sg.toString()}', 
              '${jsonData.na.toString()}', '${jsonData.ua.toString()}', '${jsonData.tds.toString()}', 
              '${jsonData.alb.toString()}');`,(err)=>{
            if (err){
                throw err;
            }

            console.log('updated the records table from webhook on the database');
        })
}
module.exports = {getName, getVitals, updateRecord};