function createUser(sql, database_name, credentials, email, callback) {
    sql.query(`INSERT INTO ${database_name}.${credentials.tableName} (${credentials.email})
    VALUES('${email}');`, (err) => {
        if (err) {
            throw err;
        }
        else {
            console.log('User Added Successfully');
            if (typeof callback == 'function') {
                callback(sql, database_name, credentials, email);
            }
        }
    })
}

function link(sql, database_name, vitals, email, id) {
    sql.query(`UPDATE ${database_name}.${vitals.tableName} set ${vitals.email} = '${email}'
    WHERE ${vitals.id} = '${id}';`, (err) => {
        if (err) {
            throw err;
        }
        console.log("Data Linked Successfully Successfully");
    });
}

async function update(sql, database_name, credentials, email, data) {
    return new Promise((resolve, reject) => {
        sql.query(`UPDATE ${database_name}.${credentials.tableName} 
        set ${credentials.personName} = '${data.personName}',
        ${credentials.gender} = '${data.personGender}', 
        ${credentials.dob} = '${data.personDoB}'
        WHERE ${credentials.email}='${email}';`, (err) => {
            if (err) {
                throw err;
            }
            else {
                resolve(1);
            }
        })
    })
}
module.exports = { createUser, link, update };