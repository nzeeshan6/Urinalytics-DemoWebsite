function check(sql) {
    const database_name = "Uri_Consumer_DB";
    const table = {
        credentials: {
            tableName: "Credential_TB",
            email: "Cred_email",
            personName: "Cred_name",
            gender: "Cred_gender",
            dob: "Cred_dob",
            otp: "Cred_otp",
            otprequest:"Cred_otp_request",
        },
        vitals: {
            tableName: "Records_TB",
            id: "Unique_ID",
            email: "Associated_Email",
            date: "pushDate",
            time: "pushTime",
            particleID: "Particle_ID",
            location: "Location",
            ph: "pH_of_Urine",
            gravity: "Specific_Gravity_of_Urine",
            sodium: "Sodium_of_Urine",
            uricAcid: "Uric_Acid_of_Urine",
            tds: "TDS_of_Urine",
            albumin: "Albumin_in_Urine"
        }
    }
    sql.query('CREATE DATABASE IF NOT EXISTS URI_SESSIONS;', (err)=>{
        if (err){
            throw err;
        }
        console.log("Sessions Database CHeck Successfull");
    })
    sql.query(`CREATE DATABASE IF NOT EXISTS ${database_name};`, function (err) {
        if (err) {
            throw err;
        }
        console.log("Database Check Successfull");

        sql.query(`CREATE TABLE IF NOT EXISTS ${database_name}.${table.credentials.tableName}(
            ${table.credentials.email} varchar(255),
            ${table.credentials.personName} varchar(255),
            ${table.credentials.dob} date,
            ${table.credentials.gender} varcharacter(255),
            ${table.credentials.otp} varcharacter(255),
            ${table.credentials.otprequest} datetime,
            primary key (${table.credentials.email})
        );`, function (err) {
            if (err) {
                throw err;
            }
            console.log('Table 1 Check Successfull');


            sql.query(`CREATE TABLE IF NOT EXISTS ${database_name}.${table.vitals.tableName}(
                ${table.vitals.id} varchar(255),
                ${table.vitals.email} varchar(255),
                ${table.vitals.date} date,
                ${table.vitals.time} time,
                ${table.vitals.particleID} varchar(255),
                ${table.vitals.location} varchar(255),
                ${table.vitals.ph} varchar(255),
                ${table.vitals.sodium} varchar(255),
                ${table.vitals.gravity} varchar(255),
                ${table.vitals.uricAcid} varchar(255),
                ${table.vitals.tds} varchar(255),
                ${table.vitals.albumin} varchar(255),
                primary key(${table.vitals.id})
            );`, function (err) {
                if (err) {
                    throw err;
                }
                console.log('Table 2 Check Successfull');
            });
        });
    });

    return {database_name, table};
}

module.exports = check;