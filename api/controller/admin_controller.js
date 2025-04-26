const adminService = require('../service/admin_service');



function sendOtpForAdminLogin(req, res) {
   const data = req.body;
 
   adminService
     .sendOtpForAdminLogin(data)
     .then((result) => {
       if (result.message) {
         console.log(result.message);
         return res.status(400).json({
           success: false,
           message: result.message,
           error:''
         });
       }
 
       return res.status(200).json({
         success: true,
         message: 'otp sent successfully',
       });
     })
     .catch((error) => {
       console.error(error);
       console.log('Something went wrong while send otp admin');
       return res.status(500).json({
         success: false,
         message: 'Something went wrong while send otp admin',
         error:error
       });
     });
}

function verifyOtpForAdminLogin(req, res) {
   const data = req.body;
 
   adminService
     .verifyOtpForAdminLogin(data)
     .then((result) => {
       if (result.message) {
         console.log(result.message);
         return res.status(400).json({
           success: false,
           message: result.message,
           error:''
         });
       }
       return res.status(200).json({
         success: true,
         message: 'otp verified successfully',
         token: result
       });
     })
     .catch((error) => {
       console.error(error);
       console.log('Something went wrong while verifying otp');
       return res.status(500).json({
         success: false,
         message: 'Something went wrong while verifying otp',
         error:error
       });
     });
}

function adminProfile(req, res){
   const ad_email = req.user.email;
   adminService
     .adminProfile(ad_email)
     .then((result) => {
       
       return res.status(200).json({
         success: true,
         message: 'admin profile fetched successfully',
         result:result
       });
     })
     .catch((error) => {
       console.error(error);
       console.log('Something went wrong while fetching admin profile');
       return res.status(500).json({
         success: false,
         message: 'Something went wrong while fetching admin profile',
         error:error
       });
     });
} 


function uploadProfilePic(req,res){
   const ad_id = req.body.ad_id;
   const profilePic = req.file.filename;
   //console.log(c_id, profilePic);
   adminService.uploadProfilePic(ad_id, profilePic).then((result) => {
      //console.log('profile pic uploaded successfully:', result);
      return res.status(200).json(
         {
            success:true,
            message:"profile pic uploaded successfully"
         }
      )
    })
    .catch((error) => {
      //console.error('Error uploading profile pic:', error);
      return res.status(500).json(
         {
            success:false,
            message:"error uploading profile pci",
            error:error
         }
      )
    });
} 



function insertAdminContact(req,res){
    const data = req.body;
    adminService.insertAdminContact(data).then((result) => {
       console.log('contact inserted:', result);
       return res.status(200).json(
          {
             success:true,
             message:"contact inserted successfully"
          }
       )
     })
     .catch((error) => {
       console.error('Error inserting contact:', error);
       return res.status(500).json(
          {
             success:false,
             message:"error inserting contact",
             error:error
          }
       )
     });
}

function uploadOffer(req,res){
      const offerImage = req.file.filename;
      const p_id = req.body.p_id;
      const text1 = req.body.of_text1;
      const text2 = req.body.of_text2;
      const text3 = req.body.of_text3;
      adminService.uploadOffer(offerImage, text1, text2, text3, p_id,).then((result) => {
         console.log('offer image uploaded successfully:', result);
         return res.status(200).json(
            {
               success:true,
               message:"offer image uploaded successfully"
            }
         )
       })
       .catch((error) => {
         console.error('Error uploading offer image:', error);
         return res.status(500).json(
            {
               success:false,
               message:"error uploading offer image",
               error:error
            }
         )
       });
}

function deleteOffer(req,res){
  const data=req.body;
  adminService.deleteOffer(data , (error,result)=>{
        
      if(error){
          console.log(error);
          console.log('something went wrong while deleting offers');
          return res.status(500).json({
              success:false,
              message:"something went wrong while deleting offers",
              error:error
          })
       }
       return res.status(200).json({
          success:true,
          message:"offer removed successfully."
       })


  } );
}


function fetchCustomerRequest(req,res){
  const { filterOptions, paginationOptions } = req.body;
      
      adminService.fetchCustomerRequest(filterOptions, paginationOptions).then((result) => {
         console.log('customer request fetch successfully:', result);
         return res.status(200).json(
            {
               success:true,
               message:"customer request fetch successfully",
               result:result
            }
         )
       })
       .catch((error) => {
         console.error('Error fetching customer request:', error);
         return res.status(500).json(
            {
               success:false,
               message:"error fetching customer request",
               error:error
            }
         )
       });
}  

function insertPropertyDetails(req,res){
      const data = req.body;
      adminService.insertPropertyDetails(data,(error,result)=>{
        if(error){
           console.log(error);
           console.log('something went wrong while inserting property details');
           return res.status(500).json({
               success:false,
               message:"something went wrong while inserting property details",
               error:error
           })
        }
        if (result.message) {
           console.log(result.message);
           return res.status(400).json({
               success: false,
               message: result.message,
               error:''
           });
       }
        return res.status(200).json({
           success:true,
           message:"property listed successfully."
        })
      });
}

function deleteProperty(req,res){
   const data = req.body;
   adminService.deleteProperty(data,(error,result)=>{
     if(error){
        console.log(error);
        console.log('something went wrong while deleting property');
        return res.status(500).json({
            success:false,
            message:"something went wrong while deleting property",
            error:error
        })
     }
     if (result.message) {
        console.log(result.message);
        return res.status(400).json({
            success: false,
            message: result.message,
            error:''
        });
    }
     return res.status(200).json({
        success:true,
        message:"property deleted successfully."
     })
   });
}

function insertProjectDetails(req,res){
   const data = req.body;
   adminService.insertProjectDetails(data,(error,result)=>{
     if(error){
        console.log(error);
        console.log('something went wrong while inserting project details');
        return res.status(500).json({
            success:false,
            message:"something went wrong while inserting project details",
            error:error
        })
     }
     if (result.message) {
        console.log(result.message);
        return res.status(400).json({
            success: false,
            message: result.message,
            error:''
        });
    }
     return res.status(200).json({
        success:true,
        message:"project added successfully."
     })
   });
}

function fetchProject(req,res){
   adminService.fetchProject().then((result) => {
      console.log('project fetched:', result);
      return res.status(200).json(
         {
            success:true,
            message:"project fetched successfully",
            result:result
         }
      )
    })
    .catch((error) => {
      console.error('Error fetching project:', error);
      return res.status(500).json(
         {
            success:false,
            message:"error fetching project",
            error:error
         }
      )
    });
}

function fetchProjectWithPagination(req,res){
   const {filterOptions, paginationOptions} = req.body;
   adminService.fetchProjectWithPagination(filterOptions,paginationOptions).then((result) => {
      console.log('project list fetched:', result);
      return res.status(200).json(
         {
            success:true,
            message:"project list fetched successfully",
            result:result
         }
      )
    })
    .catch((error) => {
      console.error('Error fetching project:', error);
      return res.status(500).json(
         {
            success:false,
            message:"error fetching project",
            error:error
         }
      )
    });
 }


function uploadPropertyImage(req,res){
  const p_id = req.body.p_id;
  console.log(p_id);
  const propertyImage = req.file.filename;
  console.log(`property image is ${propertyImage}`);
  adminService.uploadPropertyImage(p_id, propertyImage , (error,result)=>{
        
      if(error){
          console.log(error);
          console.log('something went wrong while uploading property image');
          return res.status(500).json({
              success:false,
              message:"something went wrong while uploading property image",
              error:error
          })
       }
       return res.status(200).json({
          success:true,
          message:"property image uploaded successfully."
       })


  } );
}

function deletePropertyImage(req,res){
  const data=req.body;
  adminService.deletePropertyImage(data , (error,result)=>{
        
      if(error){
          console.log(error);
          console.log('something went wrong while deleting property image');
          return res.status(500).json({
              success:false,
              message:"something went wrong while deleting property image",
              error:error
          })
       }
       return res.status(200).json({
          success:true,
          message:"property image deleted successfully."
       })


  } );
}

function changeVisitStatus(req,res){
  const data = req.body;
  adminService.changeVisitStatus(data).then((result) => {
     console.log('status changed:', result);
     return res.status(200).json(
        {
           success:true,
           message:"status changed successfully"
        }
     )
   })
   .catch((error) => {
     console.error('Error changing staus:', error);
     return res.status(500).json(
        {
           success:false,
           message:"error changing status",
           error:error
        }
     )
   });
}

function changePropertyAvailability(req,res){
  const data = req.body;
  adminService.changePropertyAvailability(data).then((result) => {
     console.log('status changed:', result);
     return res.status(200).json(
        {
           success:true,
           message:"status changed successfully"
        }
     )
   })
   .catch((error) => {
     console.error('Error changing staus:', error);
     return res.status(500).json(
        {
           success:false,
           message:"error changing status",
           error:error
        }
     )
   });
}

function updateYoutubeLink(req,res){
  const data = req.body;
  adminService.updateYoutubeLink(data).then((result) => {
     console.log('status changed:', result);
     return res.status(200).json(
        {
           success:true,
           message:"link updated successfully"
        }
     )
   })
   .catch((error) => {
     console.error('Error changing staus:', error);
     return res.status(500).json(
        {
           success:false,
           message:"error updating youtube link",
           error:error
        }
     )
   });
}

function fetchAllCustomerList(req,res){
  const {filterOptions, paginationOptions} = req.body;
  adminService.fetchAllCustomerList(filterOptions,paginationOptions).then((result) => {
     console.log('customer list fetched:', result);
     return res.status(200).json(
        {
           success:true,
           message:"customer fetched successfully",
           result:result
        }
     )
   })
   .catch((error) => {
     console.error('Error fetching customer:', error);
     return res.status(500).json(
        {
           success:false,
           message:"error fetching customer",
           error:error
        }
     )
   });
}

function fetchAllEmployeeList(req,res){
   const {filterOptions, paginationOptions} = req.body;
   adminService.fetchAllEmployeeList(filterOptions,paginationOptions).then((result) => {
      console.log('employee list fetched:', result);
      return res.status(200).json(
         {
            success:true,
            message:"employee fetched successfully",
            result:result
         }
      )
    })
    .catch((error) => {
      console.error('Error fetching employee:', error);
      return res.status(500).json(
         {
            success:false,
            message:"error fetching employee",
            error:error
         }
      )
    });
 }

function postBlog(req,res){
   const data = req.body;
   adminService.postBlog(data).then((result) => {
      console.log('blog posted:', result);
      return res.status(200).json(
         {
            success:true,
            message:"blog posted successfully"
         }
      )
    })
    .catch((error) => {
      console.error('Error while posting blog:', error);
      return res.status(500).json(
         {
            success:false,
            message:"error while posting blog",
            error:error
         }
      )
    });
}


function changeEmployeeStatus(req,res){
   const data = req.body;
   adminService.changeEmployeeStatus(data).then((result) => {
      console.log('status changed:', result);
      return res.status(200).json(
         {
            success:true,
            message:"status changed successfully"
         }
      )
    })
    .catch((error) => {
      console.error('Error changing staus:', error);
      return res.status(500).json(
         {
            success:false,
            message:"error changing status",
            error:error
         }
      )
    });
 }


 
module.exports = {
   sendOtpForAdminLogin,
   verifyOtpForAdminLogin,
   adminProfile,
   insertPropertyDetails,
   deleteProperty,
   insertProjectDetails,
   fetchProject,
   fetchProjectWithPagination,
   changePropertyAvailability,
   updateYoutubeLink,
   insertAdminContact, 
   uploadOffer,
   deleteOffer,
   fetchCustomerRequest,
   uploadPropertyImage,
   deletePropertyImage,
   changeVisitStatus,
   fetchAllCustomerList,
   fetchAllEmployeeList,
   postBlog,
   changeEmployeeStatus,
   uploadProfilePic
}   
