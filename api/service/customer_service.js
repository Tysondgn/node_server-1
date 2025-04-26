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

        //console.log(otpData.otp);
        //console.log(otpData.expirationTime);

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
  //console.log(otpData.otp);

  if (otpData.otp === data.c_otp){
      const currentTime = Date.now();
      //console.log('valid otp');
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

function updateCustomerDetails(data,callback){
  //console.log('update customer methond called');
  const sqlQuery = `
  UPDATE customer SET
  customer_name = '${data.c_name}',
  customer_mobile = ${data.c_mobile}, 
  customer_email = '${data.c_email}',
  customer_address = '${data.c_address}',
  customer_locality = '${data.c_locality}', 
  customer_city = '${data.c_city}', 
  customer_pincode = ${data.c_pincode}
  WHERE customer_id = ${data.c_id}
  `;
  //console.log(sqlQuery);
  conn.query(
    `
     ${sqlQuery}
    `,
    [],
    (updateError, updateResult) => {
        if (updateError) {
            return callback(updateError);
        }

        return callback(null, updateResult);
    }
);
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
  
          //console.log(otpData.otp);
          //console.log(otpData.expirationTime);
  
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
    //console.log(otpData.otp);

    if (otpData.otp === data.c_otp){
        const currentTime = Date.now();
       // console.log('valid otp');
        if(currentTime<= otpData.expirationTime){
            const token = auth.generateAccessToken(data.c_email);
         //   console.log('authenticated otp');
          //  console.log(token);
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
        //  console.log(selectResult);
          if (selectResult && selectResult.pi_name) {
              selectResult.pi_name = selectResult.pi_name.split(',');
            } else {
              // Set pi_name to null or an empty array if there are no images
              selectResult.pi_name = []; // or an empty array []
            }
          //console.log(selectResult);
          return callback(null, selectResult);
      }

  );
}

//===========================================fetch all proeprty by pegination
function fetchAllPropertiesWithPaginationAndFilter(filterOptions, paginationOptions, callback) {
  // Define the filter conditions
  //console.log(`filter option is ${filterOptions.propertytype}`);
  //console.log(`pegination option is ${paginationOptions}`);
  const filterConditions = [];
  const filterValues = [];

  if (filterOptions.propertytype) {
    filterConditions.push(`property_type = '${filterOptions.propertytype}'`);
    filterValues.push(filterOptions.propertytype);
  }



      // Check if project id is provided
if (filterOptions.propertyUn !== undefined && filterOptions.propertyUn !== null) {
  if (filterOptions.propertyUn === 0) {
    // Include 0 bhk and greater than 0 bhk
    filterConditions.push(`property.property_un >= ${0}`);
  } else {
    // Include specific bhk
    filterConditions.push(`property.property_un = ${filterOptions.propertyUn}`);
    filterValues.push(filterOptions.propertyUn);
  }
}



    // Check if project id is provided
if (filterOptions.projectId !== undefined && filterOptions.projectId !== null) {
  if (filterOptions.projectId === 0) {
    // Include 0 bhk and greater than 0 bhk
    filterConditions.push(`property.project_id >= ${0}`);
  } else {
    // Include specific bhk
    filterConditions.push(`property.project_id = ${filterOptions.projectId}`);
    filterValues.push(filterOptions.projectId);
  }
}



  // Check if propertybhk is provided
if (filterOptions.propertybhk !== undefined && filterOptions.propertybhk !== null) {
  if (filterOptions.propertybhk === 0) {
    // Include 0 bhk and greater than 0 bhk
    filterConditions.push(`property_bhk >= ${0}`);
  } else {
    // Include specific bhk
    filterConditions.push(`property_bhk = ${filterOptions.propertybhk}`);
    filterValues.push(filterOptions.propertybhk);
  }
}

// Check if propertyfloor is provided
if (filterOptions.propertyfloor !== undefined && filterOptions.propertyfloor !== null) {
  if (filterOptions.propertyfloor === 0) {
    // Include 0 floor and greater than 0 floor
    filterConditions.push(`property_floor >= 0`);
  } else {
    // Include specific floor
    filterConditions.push(`property_floor = ${filterOptions.propertyfloor}`);
    filterValues.push(filterOptions.propertyfloor);
  }
}

  // Add more conditions for other filters

  // Check if minPrice is provided
  if (filterOptions.minPrice !== undefined && filterOptions.minPrice !== null) {
    filterConditions.push(`property_price >= ${filterOptions.minPrice}`);
    filterValues.push(filterOptions.minPrice);
  }

  // Check if maxPrice is provided
  if (filterOptions.maxPrice !== undefined && filterOptions.maxPrice !== null) {
    filterConditions.push(`property_price <= ${filterOptions.maxPrice}`);
    filterValues.push(filterOptions.maxPrice);
  }

  // check if garden provided
  if (filterOptions.propertygarden) {
    filterConditions.push(`property_isGarden = '${filterOptions.propertygarden}'`);
    filterValues.push(filterOptions.propertygarden);
  }

  //check if parking provided
  if (filterOptions.propertyparking) {
    filterConditions.push(`property_isParking = '${filterOptions.propertyparking}'`);
    filterValues.push(filterOptions.propertyparking);
  }

  //check if parking provided
  if (filterOptions.propertyfurnished) {
    filterConditions.push(`property_isFurnished = '${filterOptions.propertyfurnished}'`);
    filterValues.push(filterOptions.propertyfurnished);
  }

  //check for availability
  if (filterOptions.propertyavailability) {
    filterConditions.push(`property_isAvailable = '${filterOptions.propertyavailability}'`);
    filterValues.push(filterOptions.propertyavailability);
  }

  if (filterOptions.propertyname) {
    filterConditions.push(`property_name LIKE '%${filterOptions.propertyname}%'`);
    filterValues.push(filterOptions.propertyname);
  }

  if (filterOptions.propertycity) {
    filterConditions.push(`property_city LIKE  '%${filterOptions.propertycity}%'`);
    filterValues.push(filterOptions.propertycity);
  }

  // Construct the WHERE clause based on the filter conditions
  const whereClause = filterConditions.length > 0 ? `WHERE ${filterConditions.join(' AND ')}` : '';

  // Construct the SQL query with pagination and filtering
  const sqlQuery = `
  SELECT
    property.property_id,
    property.property_name,
    property.property_un,
    property.property_isAvailable,
    property.property_price,
    property.property_area,
    property.property_areaUnit,
    property.property_locality,
    property.property_city,
    GROUP_CONCAT(property_image.image_url) AS pi_name,
    COALESCE(SUM(review.r_rating), 0) AS total_rating,
    COALESCE(review_counts.review_count, 0) AS review_count
FROM
    property
LEFT JOIN
    property_image ON property.property_id = property_image.property_id
LEFT JOIN
    review ON property.property_id = review.property_id
LEFT JOIN
    (SELECT property_id, COUNT(*) AS review_count FROM review GROUP BY property_id) AS review_counts ON property.property_id = review_counts.property_id
${whereClause}
GROUP BY
    property.property_id
ORDER BY
    property.property_id LIMIT ?,?;
    `;

    const sqlQuery2 = `
    SELECT
    property.property_id,
    property.property_name,
    property.property_price,
    property.property_area,
    property.property_areaUnit,
    property.property_locality,
    property.property_city,
    GROUP_CONCAT(property_image.image_url) AS pi_name,
    COALESCE(SUM(review.r_rating), 0) AS total_rating,
    COALESCE(review_count, 0) AS review_count
FROM
    property

LEFT JOIN
    major_project ON property.project_id = major_project.project_id    
LEFT JOIN
    property_image ON property.property_id = property_image.property_id        
LEFT JOIN
    review ON property.property_id = review.property_id
LEFT JOIN
    (SELECT property_id, COUNT(*) AS review_count FROM review GROUP BY property_id) AS review_count ON property.property_id = review_count.property_id
${whereClause}
GROUP BY
    property.property_id
ORDER BY
    property.property_id
LIMIT ?, ?;
    `;

    //console.log(`sql query is ${sqlQuery}`);

  // Combine filter values and pagination values                      ...filterValues,
  const queryValues = [ (paginationOptions.page-1)*paginationOptions.limit, paginationOptions.limit];

  // Execute the SQL query
  conn.query(sqlQuery, queryValues, (selectError, selectResult) => {
    if (selectError) {
      return callback(selectError);
    }

    // Iterate through the result rows
    selectResult.forEach(row => {
      // Check if pi_name is not null
      if (row.pi_name) {
        // Split the pi_name string into an array
        row.pi_name = row.pi_name.split(',');
      } else {
        // Set pi_name to an empty array if there are no images
        row.pi_name = [];
      }
    });

    //console.log(selectResult);
    return callback(null, selectResult);
  });
}

function fetchSinglePropertyById(p_id){

 // console.log(`property id is ${p_id}`);
  return new Promise((resolve, reject) => {
    // Check if the combination of u_id and s_id already exists
    const sqlQuery2 = `
    SELECT
    property.*,
    GROUP_CONCAT(property_image.image_url) AS pi_name,
    COALESCE(SUM(review.r_rating), 0) AS property_rating,
    COALESCE(COUNT(review.r_id), 0) AS total_review
FROM
    property
LEFT JOIN
    property_image ON property.property_id = property_image.property_id
LEFT JOIN
    review ON property.property_id = review.property_id
WHERE
    property.property_id = ?
GROUP BY
    property.property_id;
    `;

    conn.query(
        `${sqlQuery2}`,
        [p_id],
        (selectError, selectResult) => {
            if (selectError) {
                reject(selectError);
            }
           // console.log(selectResult);
            // Iterate through the result rows
    selectResult.forEach(row => {
      // Check if pi_name is not null
      if (row.pi_name) {
        // Split the pi_name string into an array
        row.pi_name = row.pi_name.split(',');
      } else {
        // Set pi_name to an empty array if there are no images
        row.pi_name = [];
      }
    });

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
            SET r_rating = ${data.rating}, r_detail = ${data.feedback ? `'${data.feedback}'` : 'NULL'} 
            WHERE customer_id = ${data.c_id} AND property_id = ${data.p_id}`;

          conn.query(updateQuery, [], (updateErr, updateResult) => {
            if (updateErr) {
              reject(updateErr);
              return;
            }
            resolve(updateResult);
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
              resolve(insertResult);
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

function fetchOffer(data){
  return new Promise((resolve, reject) => {
    // Check if the combination of u_id and s_id already exists
    conn.query(
        `SELECT * FROM offer WHERE property_id=?`,
        [data.p_id],
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
       p.*,
       GROUP_CONCAT(pi.image_url) AS pi_name,
       COALESCE(r.total_rating, 0) AS total_rating,
       COALESCE(r.review_count, 0) AS review_count
   FROM
       favorite_property fp
   JOIN
       property p ON fp.property_id = p.property_id
   LEFT JOIN
       property_image pi ON p.property_id = pi.property_id
   LEFT JOIN
       (
           SELECT
               property_id,
               SUM(r_rating) AS total_rating,
               COUNT(r_id) AS review_count
           FROM
               review
           WHERE
               customer_id = ${data.c_id}  
           GROUP BY
               property_id
       ) AS r ON p.property_id = r.property_id
   WHERE
       fp.customer_id = ${data.c_id}  
   GROUP BY
       p.property_id;`,
       [],
       (selectError,selectResult)=>{
        if(selectError){
          return callback(selectError);
        }
        selectResult.forEach(row => {
          // Check if pi_name is not null
          if (row.pi_name) {
            // Split the pi_name string into an array
            row.pi_name = row.pi_name.split(',');
          } else {
            // Set pi_name to an empty array if there are no images
            row.pi_name = [];
          }
        });
        //(selectRes);
        return callback(null,selectResult);
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

function fetchVisitRequestedList(filterOptions, paginationOptions, data, callback) {
    const filterConditions = [];
    const filterValues = [];
    
    // Check if requestStatus is provided
    if (filterOptions.requestStatus !== undefined && filterOptions.requestStatus !== null) {
        if (filterOptions.requestStatus === 4) {
            // Include less than or equal to 4 bhk
            filterConditions.push(`visit.v_status <= ?`);
            filterValues.push(filterOptions.requestStatus);
        } else {
            // Include specific request status
            filterConditions.push(`visit.v_status = ?`);
            filterValues.push(filterOptions.requestStatus);
        }
    }
    
    // Check if customer_id is provided
    if (data.c_id !== undefined && data.c_id !== null) {
        filterConditions.push(`visit.customer_id = ?`);
        filterValues.push(data.c_id);
    }

    // Construct the WHERE clause based on the filter conditions
    const whereClause = filterConditions.length > 0 ? `WHERE ${filterConditions.join(' AND ')}` : '';

    // Add ORDER BY, LIMIT, and OFFSET clauses for pagination
    const orderByClause = `ORDER BY visit.v_date DESC`;
    const { page = 1, limit = 10 } = paginationOptions;
    const offset = (page - 1) * limit;
    const limitOffsetClause = `LIMIT ? OFFSET ?`;
    filterValues.push(limit, offset);

    const sqlQuery = `
    SELECT
        property.*,
        visit.v_status,
        visit.v_id,
        visit.v_date,
        visit.visiting_date,
        GROUP_CONCAT(property_image.image_url) AS pi_name,
        COALESCE(r.total_rating, 0) AS total_rating,
        COALESCE(r.review_count, 0) AS review_count
    FROM
        property
    JOIN
        visit ON property.property_id = visit.property_id
    LEFT JOIN
        property_image ON property.property_id = property_image.property_id
    LEFT JOIN
        (
            SELECT
                v.property_id,
                SUM(r.r_rating) AS total_rating,
                COUNT(*) AS review_count
            FROM
                review r
            JOIN
                visit v ON r.property_id = v.property_id
            WHERE
                v.customer_id = ?
            GROUP BY
                v.property_id
        ) AS r ON property.property_id = r.property_id
    ${whereClause}
    GROUP BY
        property.property_id, visit.v_id
    ${orderByClause}
    ${limitOffsetClause};
    `;

    // Execute the query with parameterized values
    conn.query(
        sqlQuery,
        [data.c_id, ...filterValues],
        (selectErr, selectRes) => {
            if (selectErr) {
                return callback(selectErr);
            }

            // Process the result rows
            selectRes.forEach(row => {
                // Check if pi_name is not null
                if (row.pi_name) {
                    // Split the pi_name string into an array
                    row.pi_name = row.pi_name.split(',');
                } else {
                    // Set pi_name to an empty array if there are no images
                    row.pi_name = [];
                }
            });

            return callback(null, selectRes);
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

function changeVisitStatus(data){
  //console.log(data);
  return new Promise((resolve, reject) => {
      conn.query(
        `
        UPDATE visit SET v_status = ? WHERE customer_id = ? AND property_id = ? AND v_id = ?;
        `,
        [
          data.newStatus,
          data.c_id,
          data.p_id,
          data.v_id
      ],
        (updateError, updateResult) => {
          if (updateError) {
            return reject(updateError);
          }
          resolve(updateResult);
        }
      );
    });
}


function fetchBlog(paginationOptions){
  const queryValues = [ (paginationOptions.page-1)*paginationOptions.limit, paginationOptions.limit];
  return new Promise((resolve, reject) => {
    conn.query(
      `SELECT * FROM blog LIMIT ?`,
      [queryValues],
      (selectError, selectResult) => {
        if (selectError) {
          return reject(selectError);
        }
        resolve(selectResult);
      }
    );
  });
}


module.exports = {
  customerSignup, 
  sendOtpForSignup,
  verifyOtpForSignup,
  updateCustomerDetails,
  sendOtpForLogin, 
  verifyOtpForLogin, 
  customerProfile,
  uploadProfilePic,


  fetchAllProperties, 
  fetchAllPropertiesWithPaginationAndFilter,
  fetchSinglePropertyById,
  submitPropertyRating,
  fetchOfferList,
  fetchOffer,
  fetchAdminContact,


  addtoFavorite,
  fetchFavoriteProperty,
  removeFromFavorite,
  fetchFavoritePropertyListDetails,


  requestVisit,
  fetchVisitRequestedList,
  fetchVisitRequestedPropertyDetails,
  changeVisitStatus,
  fetchBlog
}

