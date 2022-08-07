const user = require('./user');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const {google} = require('googleapis');

const CLIENT_ID = '';
const CLIENT_SECRET = '';
const REDIRECT_URI = '';
const REFRESH_TOKEN = '';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token:REFRESH_TOKEN});

async function sendEmail (email, OTP){
    try {
        const access_token = await oAuth2Client.getAccessToken();
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'setupurinalytics@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: access_token
            }
        });

        var mailOptions = {
            from: 'Urinalytics Healthcare <setupurinalytics@gmail.com>',
            to: email,
            subject: 'One Time Password | Urinalytics',
            text: `Dear Valued User,\nYour One Time Password is: ${OTP}\nThis password is only valid for 3 mins.\nPlease do not share this password with anyone.`,
            html: `<B>Dear Valued User,</B><BR><P>Your One Time Password is: <h2>${OTP}</h2></p>
            <br>This password is only valid for 3 mins.
            <br><B>Please do not share this password with anyone.</B>`
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              return error;
            } else {
              console.log('Email sent: ' + info.response);
              return 1;
            }
          });

    }catch(error){
        return error;
    }
}


function otpGenerator(sql, database_name, credentials, email) {
    console.log('Generating OTP');
    const OTP = crypto.randomInt(111111, 999999).toString();
    console.log(OTP);

    sql.query(`UPDATE ${database_name}.${credentials.tableName} set ${credentials.otp} = '${OTP}', 
    ${credentials.otprequest} = NOW() WHERE ${credentials.email} = '${email}';`, (err) => {
        if (err) {
            throw err;
        }
        const cnf = sendEmail(email, OTP);
        cnf.then(result=>console.log(result)).catch(error=>console.log(error.message));
        console.log("OTP Updated Successfully");
    });
    // send the otp
    
}
function setOTP(sql, email, database_name, table) {
    sql.query(`SELECT COUNT(${table.credentials.email}) FROM ${database_name}.${table.credentials.tableName} WHERE
    ${table.credentials.email} = '${email}';`, (err, result) => {
        if (err) {
            throw err;
        }
        else {

            // console.log(result[0]);
            // console.log(fields);
            // const resJSON = JSON.parse(result[0]);
            // console.log(resJSON);
            const isPresent = Object.values(result[0])[0];
            // console.log(isPresent);

            if (isPresent) {
                console.log('The entered email is present');
                // generate an OTP and Update it on the table.
                otpGenerator(sql, database_name, table.credentials, email);
            }
            else {
                console.log('The entered email is not Present');
                // create a profile and then generate an OTP.

                user.createUser(sql, database_name, table.credentials, email, otpGenerator);
            }
        }
    })
}

async function authorise(sql, database_name, table, email, otp) {
    // var isPresent;
    return new Promise((resolve, reject) => {

        // resolve(1);
        sql.query(`SELECT COUNT(${table.credentials.email}) FROM ${database_name}.${table.credentials.tableName} WHERE
            ${table.credentials.email} = '${email}' AND ${table.credentials.otp} = '${otp}' AND 
            TIMESTAMPDIFF(MICROSECOND, ${table.credentials.otprequest}, NOW()) / 1000 <= 180000;`, (err, result) => {
            if (err) {
                throw err;
            }
            else {

                // console.log(result[0]);
                // console.log(fields);
                // const resJSON = JSON.parse(result[0]);
                // console.log(resJSON);
                const isPresent = Object.values(result[0])[0];
                // console.log(isPresent);

                if (isPresent) {
                    console.log('Authorization Success');
                    // generate an OTP and Update it on the table.

                }
                else {
                    console.log('Access Denied!!!!!');
                    // create a profile and then generate an OTP.
                    // user.createUser(sql, database_name, table.credentials, email, otpGenerator);
                }
                resolve(isPresent);
            }
        });


    });


}

async function checkProfile(sql, database_name, table, email) {
    return new Promise((resolve, reject) => {
        sql.query(`SELECT COUNT(${table.credentials.email}) FROM ${database_name}.${table.credentials.tableName} WHERE
        ${table.credentials.email} = '${email}' AND ${table.credentials.personName} IS NOT NULL;`, (err, result) => {
            if (err) {
                throw err;
            }
            else {
                const isPresent = Object.values(result[0])[0];
                // console.log(isPresent);

                if (isPresent) {
                    console.log('Profile Present... Redirect to the dashboard Page');
                    // generate an OTP and Update it on the table.

                }
                else {
                    console.log('Profile Absent.. Redirect to the Registration Page');
                    // create a profile and then generate an OTP.
                    // user.createUser(sql, database_name, table.credentials, email, otpGenerator);
                }
                resolve(isPresent);
            }

        });
    })
}

function associateData(sql, database_name, table, email, id) {
    sql.query(`SELECT COUNT(${table.vitals.id}) FROM ${database_name}.${table.vitals.tableName} 
    WHERE ${table.vitals.id} = '${id}' AND ${table.vitals.email} IS NULL;`, (err, result) => {
        if (err) {
            throw err;
        }
        else {
            const isAbsent = Object.values(result[0])[0];
            // console.log(isPresent);

            if (isAbsent) {
                console.log('Id Present and Data is unassociated');
                console.log('Associating the data');

                user.link(sql, database_name, table.vitals, email, id);
                // generate an OTP and Update it on the table.

            }
            else {
                console.log('Invalid Id or Already Associated');
                // create a profile and then generate an OTP.
                // user.createUser(sql, database_name, table.credentials, email, otpGenerator);
            }
        }
    })
}

async function profileUpdate(sql, database_name, table, email, data) {
    return new Promise((resolve, reject) => {
        let isSuccess = user.update(sql, database_name, table.credentials, email, data);

        isSuccess.then(data => resolve(data));
    })
}
module.exports = { setOTP, authorise, checkProfile, associateData, profileUpdate }