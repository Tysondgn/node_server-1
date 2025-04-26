const adminRouter = require('../routes');
const adminController = require('../controller/admin_controller');
const offerUploads = require('../../middleware/offerUploads');
const auth = require('../../middleware/auth');
const propertyUpload = require('../../middleware/propertyImageUploads');
const adminUploads = require('../../middleware/adminUploads');

adminRouter.post('/insertPropertyDetails', auth.authenticateToken, adminController.insertPropertyDetails);
adminRouter.post('/deleteProperty', auth.authenticateToken, adminController.deleteProperty);
adminRouter.post('/insertProjectDetails', auth.authenticateToken, adminController.insertProjectDetails);
adminRouter.get('/fetchProject', adminController.fetchProject);
adminRouter.post('/fetchProjectWithPagination', adminController.fetchProjectWithPagination);
adminRouter.post('/sendOtpForAdminLogin', adminController.sendOtpForAdminLogin);
adminRouter.post('/verifyOtpForAdminLogin', adminController.verifyOtpForAdminLogin);
adminRouter.get('/adminProfile', auth.authenticateToken, adminController.adminProfile);
adminRouter.post('/uploadAdminProfilePic', auth.authenticateToken, adminUploads.single('adminProfilePic') ,adminController.uploadProfilePic);



adminRouter.post('/insertAdminContact', auth.authenticateToken, adminController.insertAdminContact);
// Handle the file upload in your adminController
adminRouter.post('/uploadOffer', auth.authenticateToken, offerUploads, (req, res) => {
    // If you reach this point, the file upload was successful
    // Now you can handle additional logic using your adminController
    adminController.uploadOffer(req, res);
  });

adminRouter.post('/deleteOffer', auth.authenticateToken, adminController.deleteOffer);
adminRouter.post('/fetchCustomerRequest', auth.authenticateToken, adminController.fetchCustomerRequest);
adminRouter.post('/uploadPropertyImage', auth.authenticateToken, propertyUpload.upload, adminController.uploadPropertyImage);
adminRouter.post('/deletePropertyImage', auth.authenticateToken, adminController.deletePropertyImage);
adminRouter.put('/changeVisitStatus', auth.authenticateToken, adminController.changeVisitStatus);
adminRouter.put('/changePropertyAvailability', auth.authenticateToken, adminController.changePropertyAvailability);
adminRouter.put('/updateYoutubeLink', auth.authenticateToken, adminController.updateYoutubeLink);
adminRouter.post('/fetchAllCustomerList', auth.authenticateToken, adminController.fetchAllCustomerList);
adminRouter.post('/fetchAllEmployeeList', auth.authenticateToken, adminController.fetchAllEmployeeList);
adminRouter.post('/postBlog', auth.authenticateToken, adminController.postBlog);
adminRouter.put('/changeEmployeeStatus', auth.authenticateToken, adminController.changeEmployeeStatus);


module.exports = adminRouter;
