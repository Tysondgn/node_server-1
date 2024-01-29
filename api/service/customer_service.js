const conn = require('../../database/config');
const auth = require('../../middleware/auth');
const mailer = require('../../middleware/mailer');
const randomstring = require('randomstring');
const NodeCache = require('node-cache');
const otpCache = new NodeCache();

function sendOtpForSignup(data){
  return new Promise((resolve, reject) => {
    conn.query(
      'SELECT * FROM customer WHERE customer_email = ?',
      [data.c_email],
      (selectError, selectResult) => {
        if (selectError) {
          return reject(selectError);
        }

        if (selectResult.length > 0) {
          const message = 'User already exist, please login.';
          return resolve({ message });
        }

        const otp = randomstring.generate({
          length: 6,
          charset: 'numeric',
        });

        const expirationTime = Date.now() + 10 * 60 * 1000;
        otpCache.set(data.c_email, { otp, expirationTime });
        const otpData = otpCache.get(data.c_email);

        console.log(otpData.otp);
        console.log(otpData.expirationTime);

        mailer
          .sendEmail(data.c_email, 'signup verification code', `Your Signup verification code is: ${otp}`)
          .then((result) => {
            // Assuming mailer.sendEmail is an asynchronous function
            // If it's synchronous, you can remove the .then() and just use the callback immediately after generating OTP

            // Resolve with success and OTP details
            resolve(result);
          })
          .catch((error) => {
            // Handle error
            reject(error);
          });
      }
    );
  });
}

function verifyOtpForSignup(data, callback){
  const otpData = otpCache.get(data.c_email);
  console.log(otpData.otp);

  if (otpData.otp === data.c_otp){
      const currentTime = Date.now();
      console.log('valid otp');
      if(currentTime<= otpData.expirationTime){
          // Check if the combination of u_id and s_id already exists
     // If the combination does not exist, insert the record
     conn.query(
      'INSERT INTO customer(customer_name, customer_mobile, customer_email, customer_address, customer_locality, customer_city, customer_pincode) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
          data.c_name,
          data.c_mobile,
          data.c_email,
          data.c_address,
          data.c_locality,
          data.c_city,
          data.c_pincode

      ],
      (insertError, insertResult) => {
          if (insertError) {
              return callback(insertError);
          }

          return callback(null, insertResult);
      }
  );

      }else{
          callback({ message: 'OTP expired' });
      }
  }else{
      callback({ message: 'Invalid OTP' });
  }
}

function customerSignup(data, callback) {
    
    // Check if the combination of u_id and s_id already exists
    conn.query(
        'SELECT * FROM customer WHERE customer_mobile=?',
        [data.c_mobile],
        (selectError, selectResult) => {
            if (selectError) {
                return callback(selectError);
            }

            // If the combination already exists, return a message
            if (selectResult.length > 0) {
                const message = 'user already exist with this mobile number,please try different one.';
                return callback(null, { message });
            }

            // If the combination does not exist, insert the record
            conn.query(
                'INSERT INTO customer(customer_name, customer_mobile, customer_email, customer_address, customer_locality, customer_city, customer_pincode) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    data.c_name,
                    data.c_mobile,
                    data.c_email,
                    data.c_address,
                    data.c_locality,
                    data.c_city,
                    data.c_pincode

                ],
                (insertError, insertResult) => {
                    if (insertError) {
                        return callback(insertError);
                    }

                    return callback(null, insertResult);
                }
            );
        }
    );
}
otpData={};
function sendOtpForLogin(data) {
    return new Promise((resolve, reject) => {
      conn.query(
        'SELECT * FROM customer WHERE customer_email = ?',
        [data.c_email],
        (selectError, selectResult) => {
          if (selectError) {
            return reject(selectError);
          }
  
          if (selectResult.length === 0) {
            const message = 'User does not exist, please sign up.';
            return resolve({ message });
          }
  
          const otp = randomstring.generate({
            length: 6,
            charset: 'numeric',
          });
  
          const expirationTime = Date.now() + 10 * 60 * 1000;
          otpCache.set(data.c_email, { otp, expirationTime });
          const otpData = otpCache.get(data.c_email);
  
          console.log(otpData.otp);
          console.log(otpData.expirationTime);
  
          mailer
            .sendEmail(data.c_email, 'login otp', `Your login OTP is: ${otp}`)
            .then((result) => {
              // Assuming mailer.sendEmail is an asynchronous function
              // If it's synchronous, you can remove the .then() and just use the callback immediately after generating OTP
  
              // Resolve with success and OTP details
              resolve(result);
            })
            .catch((error) => {
              // Handle error
              reject(error);
            });
        }
      );
    });
}
function verifyOtpForLogin(data, callback){
    const otpData = otpCache.get(data.c_email);
    console.log(otpData.otp);

    if (otpData.otp === data.c_otp){
        const currentTime = Date.now();
        console.log('valid otp');
        if(currentTime<= otpData.expirationTime){
            const token = auth.generateAccessToken(data.c_email);
            console.log('authenticated otp');
            console.log(token);
            callback(null, token );

        }else{
            callback({ message: 'OTP expired' });
        }
    }else{
        callback({ message: 'Invalid OTP' });
    }
}
function customerProfile(c_email, callback){
    conn.query(
        `SELECT * FROM customer WHERE customer_email = ?`,
        [c_email],
        (selectError, selectResult)=>{
            if(selectError){
              return callback(selectError);
            }
            return callback(null, selectResult[0]);

        }
    )
}
function uploadProfilePic(c_id, profilePic){
  return new Promise((resolve, reject) => {
    // Check if the combination of u_id and s_id already exists
    conn.query(
        `UPDATE customer SET customer_profilePic = ? WHERE customer_id = ?`,
        [
          profilePic,
          c_id
        ],
        (updateError, updateResult) => {
            if (updateError) {
                reject(updateError);
            }
            resolve(updateResult); 
        }
    );
});
}








function fetchAllProperties(callback){
  conn.query(
      `SELECT
      property.*,
      GROUP_CONCAT(property_image.image_url) AS pi_name
  FROM
      property
  LEFT JOIN
      property_image ON property.property_id = property_image.property_id
  GROUP BY
      property.property_id;`,
      [],
      (selectError, selectResult) => {
          if (selectError) {
              return callback(selectError);
          }
          console.log(selectResult);
          if (selectResult && selectResult.pi_name) {
              selectResult.pi_name = selectResult.pi_name.split(',');
            } else {
              // Set pi_name to null or an empty array if there are no images
              selectResult.pi_name = []; // or an empty array []
            }
          console.log(selectResult);
          return callback(null, selectResult);
      }

  );
}

function fetchSinglePropertyById(p_id){

  return new Promise((resolve, reject) => {
    // Check if the combination of u_id and s_id already exists
    conn.query(
        `
        SELECT
    property.*,
    GROUP_CONCAT(property_image.image_url) AS pi_name
FROM
    property
LEFT JOIN
    property_image ON property.property_id = property_image.property_id
WHERE
    property.property_id = ?
GROUP BY
    property.property_id;
        `,
        [p_id],
        (selectError, selectResult) => {
            if (selectError) {
                reject(selectError);
            }
            resolve(selectResult); 
        }
    );
});


}
function calculateAverage(rating, customerRating) {
  // Convert input values to numbers if they are provided as strings
  const numericRating = parseFloat(rating);
  const numericCustomerRating = parseFloat(customerRating);

  // Check if conversion was successful
  if (isNaN(numericRating) || isNaN(numericCustomerRating)) {
    throw new Error('Invalid input. Both rating and customerRating must be numeric values.');
  }

  return (numericRating + numericCustomerRating) / 2;
}
function submitPropertyRating(data) {
  return new Promise((resolve, reject) => {
    conn.query(
      'SELECT * FROM review WHERE customer_id=? AND property_id=?',
      [data.c_id, data.p_id],
      (select1Error, select1Result) => {
        if (select1Error) {
          reject(select1Error);
          return;
        }

        if (select1Result.length > 0) {
          const customerRating = data.rating;
          const selectedRow = select1Result[0];
          const existingRating = selectedRow['r_rating'];

          // Calculate the new average rating
          global.newRating = calculateAverage(existingRating, customerRating);

          // Update the review with or without feedback
          const updateQuery = `
            UPDATE review 
            SET r_rating = ${global.newRating}, r_detail = ${data.feedback ? `'${data.feedback}'` : 'NULL'} 
            WHERE customer_id = ${data.c_id} AND property_id = ${data.p_id}`;

          conn.query(updateQuery, [], (updateErr, updateResult) => {
            if (updateErr) {
              reject(updateErr);
              return;
            }

            // Update the rating and rating count in the properties table
            conn.query(
              `UPDATE property SET property_rating = ?, property_ratingCount = (SELECT COUNT(*) FROM review WHERE property_id = ?) WHERE property_id = ?`,
              [global.newRating, data.p_id, data.p_id],
              (propertyUpdateErr, propertyUpdateResult) => {
                if (propertyUpdateErr) {
                  reject(propertyUpdateErr);
                  return;
                }

                resolve(propertyUpdateResult);
              }
            );
          });
        } else {
          // Insert a new review record
          conn.query(
            `INSERT INTO review(r_rating, r_detail, customer_id, property_id) VALUES (?, ?, ?, ?)`,
            [data.rating, data.feedback, data.c_id, data.p_id],
            (insertErr, insertResult) => {
              if (insertErr) {
                reject(insertErr);
                return;
              }

              // Update the rating and rating count in the properties table
              conn.query(
                `UPDATE property SET property_rating = ?, property_ratingCount = (SELECT COUNT(*) FROM review WHERE property_id = ?) WHERE property_id = ?`,
                [data.rating, data.p_id, data.p_id],
                (propertyUpdateErr, propertyUpdateResult) => {
                  if (propertyUpdateErr) {
                    reject(propertyUpdateErr);
                    return;
                  }

                  resolve(propertyUpdateResult);
                }
              );
            }
          );
        }
      }
    );
  });
}




function fetchOfferList(){
  return new Promise((resolve, reject) => {
    // Check if the combination of u_id and s_id already exists
    conn.query(
        `SELECT * FROM offer`,
        [],
        (selectError, selectResult) => {
            if (selectError) {
                reject(selectError);
            }
            resolve(selectResult); 
        }
    );
});
}
function fetchAdminContact(){

  return new Promise((resolve, reject)=>{
      conn.query(
          `SELECT * FROM admin_contact`,
          [
          ],
          (selectError, selectResult)=>{
              if(selectError){
                  reject(selectError);
              }
              resolve(selectResult);
          }
      )
  });

}






function addtoFavorite(data, callback){
  conn.query(
    `INSERT INTO favorite_property(customer_id, property_id) VALUES(?,?)`,
    [
      data.c_id,
      data.p_id
    ],
    (insertError, insertResult)=>{
      if(insertError){
        return callback(insertError);
      }
      return callback(null, insertResult);
    }
  )
}
function removeFromFavorite(data,callback){
  conn.query(
    `DELETE FROM favorite_property WHERE customer_id=? AND property_id=?`,
    [
      data.c_id,
      data.p_id    
    ],
    (delErr, delRes)=>{
        if(delErr){
          return callback(delErr);
        }
        return callback(null, delRes);
    }
  );
}
function fetchFavoriteProperty(data,callback){
  conn.query(
      `SELECT * FROM favorite_property WHERE property_id=? AND customer_id=?`,
      [
        data.p_id,
        data.c_id
      ],
      (selectError, selectResult)=>{
         if(selectError){
          return callback(selectError);
         }
         return callback(null, selectResult);
      });
}
function fetchFavoritePropertyListDetails(data,callback){
    conn.query(
       `SELECT
       property.*,
       GROUP_CONCAT(property_image.image_url) AS pi_name
   FROM
       property
   JOIN
       favorite_property ON property.property_id = favorite_property.property_id
   LEFT JOIN
       property_image ON property.property_id = property_image.property_id
   WHERE
       favorite_property.customer_id = ?
   GROUP BY
       property.property_id;`,
       [data.c_id],
       (selectErr,selectRes)=>{
        if(selectErr){
          return callback(selectErr);
        }
        console.log(selectRes);
        return callback(null,selectRes);
       }
    );
}




function requestVisit(data, callback){

  conn.query(
     `INSERT INTO visit(customer_id, property_id, visiting_date,visitor_name, visitor_number, employee_un) VALUES(?,?,?,?,?,?)`,
     [
      data.c_id,
      data.p_id,
      data.v_date,
      data.visitor_name,
      data.visitor_number,
      data.employee_un
     ],
     (insertErr, insertResult)=>{
      if (insertErr) {
          return callback(insertErr);
      }
      return callback(null, insertResult);
     });

}
function fetchVisitRequestedList(data,callback){
  conn.query(
     `SELECT
     property.*,
     visit.v_status,
     GROUP_CONCAT(property_image.image_url) AS pi_name
 FROM
     property
 JOIN
     visit ON property.property_id = visit.property_id
 LEFT JOIN
     property_image ON property.property_id = property_image.property_id
 WHERE
     visit.customer_id = ?
 GROUP BY
     property.property_id, visit.v_id`,
     [data.c_id],
     (selectErr,selectRes)=>{
      if(selectErr){
        return callback(selectErr);
      }
      return callback(null,selectRes);
     }
  );
}
function fetchVisitRequestedPropertyDetails(data, callback){
  conn.query(
    `SELECT * FROM property WHERE property_id = ?`,
    [data.p_id],
    (selectErr,selectRes)=>{
      if(selectErr){
        return callback(selectErr);
      }
      return callback(null,selectRes);
    }
  );
}


module.exports = {
  customerSignup, 
  sendOtpForSignup,
  verifyOtpForSignup,
  sendOtpForLogin, 
  verifyOtpForLogin, 
  customerProfile,
  uploadProfilePic,


  fetchAllProperties, 
  fetchSinglePropertyById,
  submitPropertyRating,
  fetchOfferList,
  fetchAdminContact,


  addtoFavorite,
  fetchFavoriteProperty,
  removeFromFavorite,
  fetchFavoritePropertyListDetails,


  requestVisit,
  fetchVisitRequestedList,
  fetchVisitRequestedPropertyDetails,
}


// `SELECT DISTINCT property.*, property_image.image_url
//        FROM property
//        JOIN favorite_property ON property.property_id = favorite_property.property_id
//        LEFT JOIN property_image ON property.property_id = property_image.property_id
//        WHERE favorite_property.customer_id = ?`,



// // If the combination already exists, return a message
// console.log(selectResult);
// const rating = selectResult[0]['p_rating'];
// const ratingCount = selectResult[0]['p_ratingCount'];
// console.log(rating);
// console.log(ratingCount);
// const customerRating = data.rating;
// console.log(customerRating);
// const newRatingCount = ratingCount + 1;
// const newRating = calculateAverage(rating,customerRating);
// console.log(newRating);
// console.log(newRatingCount);