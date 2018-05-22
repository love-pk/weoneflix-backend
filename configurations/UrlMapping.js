	module.exports = function (app) {

	    var controllers = app.controllers,
	        views = app.views;
	    return {
	        "/api/v1/videos": [{
	            method: "GET",
	            action: controllers.videoController.getVideos,
	            middleware: [configurationHolder.security.authority({
	                activity: "Get_Videos"
	            })],
	            views: {
	                json: views.jsonView
	            }
	       }],

	        "/api/v1/video/morevideos/": [{
	            method: "GET",
	            action: controllers.videoController.getMoreVideos,
	            middleware: [configurationHolder.security.authority({
	                activity: "Generic"
	            })],
	            views: {
	                json: views.jsonView
	            }
	       }],

	        "/api/v1/video/detail/:id": [{
	            method: "GET",
	            action: controllers.videoController.getVideoDetail,
	            middleware: [configurationHolder.security.authority({
	                activity: "Generic"
	            })],
	            views: {
	                json: views.jsonView
	            }
	       }],

	        "/api/v1/comment": [{
	            method: "POST",
	            action: controllers.commentController.createComment,
	            middleware: [configurationHolder.security.authority({
	                activity: "Create_Comment"
	            })],
	            views: {
	                json: views.jsonView
	            }
				}],

	        "/api/v1/comment/": [{
	                method: "GET",
	                action: controllers.commentController.getComments,
	                middleware: [configurationHolder.security.authority({
	                    activity: "Get_Comments"
	                })],
	                views: {
	                    json: views.jsonView
	                }
				}
			],

	        "/api/v1/headBanner/:bannerDetails": [{
	                method: "GET",
	                action: controllers.videoController.getHeadBanner,
	                middleware: [],
	                views: {
	                    json: views.jsonView
	                }
				},
	            {
	                method: "POST",
	                action: controllers.videoController.setHeadBanner,
	                middleware: [configurationHolder.security.authority({
	                    activity: "Set_HeadBanner_Videos"
	                })],
	                views: {
	                    json: views.jsonView
	                }
				}
			],
	        "/api/v1/video": [{
	                method: "POST",
	                action: controllers.videoController.createVideo,
	                middleware: ["hello"],
	                views: {
	                    json: views.jsonView
	                }
				}
			],
	        "/api/v1/video/uploadBanner": [{
	            method: "POST",
	            action: controllers.videoUploadController.uploadVideoBanner,
	            middleware: [configurationHolder.security.authority({
	                activity: "Upload_Video_Banner"
	            })],
	            views: {
	                json: views.jsonView
	            }
	       }],
	        "/api/v1/video/banner/:id": [{
	            method: "PUT",
	            action: controllers.videoUploadController.updateVideoImages,
	            middleware: [configurationHolder.security.authority({
	                activity: "Update_Video_Images"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/video/search": [{
	            method: "GET",
	            action: controllers.videoController.searchVideo,
	            middleware: [configurationHolder.security.authority({
	                activity: "Search_Video"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/video/:id": [{
	                method: "GET",
	                action: controllers.videoController.getVideo,
	                middleware: ["hello"],
	                views: {
	                    json: views.jsonView
	                }
				},
	            {
	                method: "PUT",
	                action: controllers.videoController.updateVideo,
	                middleware: [configurationHolder.security.authority({
	                    activity: "Update_Video"
	                })],
	                views: {
	                    json: views.jsonView
	                }
				},
	            {
	                method: "delete",
	                action: controllers.videoController.deleteVideo,
	                middleware: [configurationHolder.security.authority({
	                    activity: "Delete_Video"
	                })],
	                views: {
	                    json: views.jsonView
	                }
				}
			],

	        "/api/v1/video/rating/:videoId": [{
	            method: "GET",
	            action: controllers.videoController.getVideoRating,
	            middleware: [configurationHolder.security.authority({
	                activity: "Get_Video_Rating"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        // to upload the video
	        "/api/v1/uploadVideo": [{
	            method: "POST",
	            action: controllers.videoUploadController.uploadVideo,
	            middleware: [configurationHolder.security.authority({
	                activity: "Upload_Video"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/video/:videoId/incrementVideoViews": [{
	            method: "PUT",
	            action: controllers.videoController.incrementVideoViews,
	            middleware: [
                        configurationHolder.security.authority({
	                    activity: "Increment_Views"
	                })
                ],
	            views: {
	                json: views.jsonView
	            }
            }],

	        //-------------------------------------------------------------------------------------
	        //---------------------------Channel API-----------------------------------------------

	        "/api/v1/channel": [{
	            method: "POST",
	            action: controllers.channelController.createChannel,
	            middleware: [configurationHolder.security.authority({
	                activity: "Create_Channel"
	            })],
	            views: {
	                json: views.jsonView
	            }
	       }],

	        "/api/v1/channels": [{
	            method: "GET",
	            action: controllers.channelController.getChannels,
	            middleware: [configurationHolder.security.authority({
	                activity: "Get_AllChannels"
	            })],
	            views: {
	                json: views.jsonView
	            }
	       }],

	        "/api/v1/channel/search": [{
	            method: "GET",
	            action: controllers.channelController.searchChannel,
	            middleware: [configurationHolder.security.authority({
	                activity: "Search_Channel"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/channel/videos/": [{
	            method: "GET",
	            action: controllers.channelController.getVideos,
	            middleware: [configurationHolder.security.authority({
	                activity: "Get_Videos"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/channel/:id": [{
	            method: "DELETE",
	            action: controllers.channelController.deleteChannel,
	            middleware: [configurationHolder.security.authority({
	                activity: "Delete_Channel"
	            })],
	            views: {
	                json: views.jsonView
	            }
	        }, {
	            method: "PUT",
	            action: controllers.channelController.updateChannel,
	            middleware: [configurationHolder.security.authority({
	                activity: "Update_Channel"
	            })],
	            views: {
	                json: views.jsonView
	            }
	        }],

	        "/api/v1/channel/detail/:id": [{
	            method: "GET",
	            action: controllers.channelController.getChannelDetail,
	            middleware: [configurationHolder.security.authority({
	                activity: "Generic"
	            })],
	            views: {
	                json: views.jsonView
	            }
	       }],

	        //--------------------------- Till Here------------------------------------------------


	        //---------------------------User API---------------------------------------------------

	        "/api/v1/user": [{
	            method: "POST",
	            action: controllers.userController.createUser,
	            middleware: [configurationHolder.security.authority({
	                activity: "Register"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }, {
	            method: "GET",
	            action: controllers.userController.getUser,
	            middleware: [configurationHolder.security.authority({
	                activity: "Get_User_Detail"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/users": [{
	            method: "GET",
	            action: controllers.userController.getAllUsers,
	            middleware: [configurationHolder.security.authority({
	                activity: "GetAllUsers"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/user/search": [{
	            method: "GET",
	            action: controllers.userController.searchUser,
	            middleware: [configurationHolder.security.authority({
	                activity: "Search_User"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/user/resetPassword": [{
	            method: "PUT",
	            action: controllers.userController.resetPassword,
	            middleware: [configurationHolder.security.authority({
	                activity: "Change_Password"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/user/forgotPassword": [{
	            method: "POST",
	            action: controllers.userController.forgotPassword,
	            middleware: [configurationHolder.security.authority({
	                activity: "Forgot_Password"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/user/updateprofile": [{
	            method: "PUT",
	            action: controllers.userController.updateprofile,
	            middleware: [configurationHolder.security.authority({
	                activity: "Update_Profile"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/user/:id": [{
	                method: "PUT",
	                action: controllers.userController.updateUser,
	                middleware: [],
	                views: {
	                    json: views.jsonView
	                }
	       },
	            {
	                method: "DELETE",
	                action: controllers.userController.deleteUser,
	                middleware: [],
	                views: {
	                    json: views.jsonView
	                }
	       }],

	        "/api/v1/user/login": [{
	            method: "POST",
	            action: controllers.userController.userLogin,
	            middleware: [configurationHolder.security.authority({
	                activity: "Login"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/user/activity": [{
	                method: "POST",
	                action: controllers.activityController.createActivity,
	                middleware: [],
	                views: {
	                    json: views.jsonView
	                }
                },
	            {
	                method: "GET",
	                action: controllers.activityController.getActivity,
	                middleware: [],
	                views: {
	                    json: views.jsonView
	                }
            }],

	        "/api/v1/user/role": [{
	                method: "POST",
	                action: controllers.roleController.createRole,
	                middleware: [],
	                views: {
	                    json: views.jsonView
	                }
				}
			],


	        "/api/v1/user/logout/:token": [{
	            method: "GET",
	            action: controllers.userController.userLogout,
	            middleware: [configurationHolder.security.authority({
	                activity: "Logout"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/user/verifyEmail/:token": [{
	            method: "GET",
	            action: controllers.userController.verifyEmail,
	            middleware: [configurationHolder.security.authority({
	                activity: "Generic"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],


	        "/api/v1/tokenValidate/:token": [{
	            method: "GET",
	            action: controllers.tokenValidateController.tokenValidate,
	            middleware: [configurationHolder.security.authority({
	                activity: "Generic"
	            })],
	            views: {
	                json: views.jsonView
	            }
	        }],


	        "/api/v1/user/missingField/:id": [{
	            method: "PUT",
	            action: controllers.userController.missingField,
	            middleware: [configurationHolder.security.authority({
	                activity: "Generic"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/user/video/rating": [{
	            method: "POST",
	            action: controllers.userController.createvideoRating,
	            middleware: [configurationHolder.security.authority({
	                activity: "Rate_Video"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/user/channel/subscribe": [{
	            method: "PUT",
	            action: controllers.userController.channelSubscribe,
	            middleware: [configurationHolder.security.authority({
	                activity: "Subscribe_Channel"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],
	        "/api/v1/user/channel/isSubscribed/:channelId": [{
	            method: "GET",
	            action: controllers.userController.isChannelSubscribed,
	            middleware: [configurationHolder.security.authority({
	                activity: "Generic"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        //---------------------------till here---------------------------------

	        //-----------------------------Admin API-------------------------------

	        "/api/v1/admin/channel": [{
	            method: "POST",
	            action: controllers.adminController.createChannelAdmin,
	            middleware: [configurationHolder.security.authority({
	                activity: "Register"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/admin": [{
	            method: "GET",
	            action: controllers.adminController.getAdminDashboard,
	            middleware: [configurationHolder.security.authority({
	                activity: "getAdminDashboard"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/admin/invite": [{
	            method: "POST",
	            action: controllers.adminController.inviteUser,
	            middleware: [configurationHolder.security.authority({
	                activity: "Create_Channel-Admin",
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        //---------------------------till here------------------------------------

	        //--------------------------------facebook Login and Signup---------------

	        "/auth/facebook/callback": [{
	            method: "GET",
	            action: controllers.userController.fbLogin,
	            middleware: [passport.authenticate('facebook', {
	                failureRedirect: '/'
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/auth/facebook": [{
	            method: "GET",
	            action: passport.authenticate('facebook', {
	                authType: 'reauthenticate',
	                scope: ["email", "user_birthday"]
	            }),
	            middleware: [configurationHolder.security.authority({
	                activity: "Login"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],
	        //---------------------------till here--------------------------------------

	        //--------------------------------Advertisement API-------------------------
	        "/api/v1/advertisement/detail/:id": [{
	            method: "GET",
	            action: controllers.advertisementController.getAdvertisementDetail,
	            middleware: [configurationHolder.security.authority({
	                activity: "Generic"
	            })],
	            views: {
	                json: views.jsonView
	            }
	       }],

	        "/api/v1/saveAsAdvertisement/:videoId": [{
	            method: "POST",
	            action: controllers.advertisementController.saveAsAdvertisement,
	            middleware: [configurationHolder.security.authority({
	                activity: "Add_Advertisement"
	            })],
	            views: {
	                json: views.jsonView
	            }
	        }],
	        "/api/v1/advertisement": [{
	                method: "POST",
	                action: controllers.advertisementController.uploadAdvertisement,
	                middleware: [configurationHolder.security.authority({
	                    activity: "Add_Advertisement"
	                })],
	                views: {
	                    json: views.jsonView
	                }
            },
	            {
	                method: "GET",
	                action: controllers.advertisementController.getAdvertisements,
	                middleware: [configurationHolder.security.authority({
	                    activity: "Get_Advertisement"
	                })],
	                views: {
	                    json: views.jsonView
	                }
            }],

	        "/api/v1/advertisement/search": [{
	            method: "GET",
	            action: controllers.advertisementController.searchAdvertisement,
	            middleware: [configurationHolder.security.authority({
	                activity: "Search_Advertisement"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/advertisement/:id": [{
	                method: "PUT",
	                action: controllers.advertisementController.updateAdvertisement,
	                middleware: [configurationHolder.security.authority({
	                    activity: "update_Advertisement"
	                })],
	                views: {
	                    json: views.jsonView
	                }
	            },
	            {
	                method: "DELETE",
	                action: controllers.advertisementController.deleteAdvertisement,
	                middleware: [configurationHolder.security.authority({
	                    activity: "delete_Advertisement"
	                })],
	                views: {
	                    json: views.jsonView
	                }

            }],
	        "/api/v1/advertisement/:entryId/:field": [{
	            method: "GET",
	            action: controllers.advertisementController.incrementViews,
	            middleware: [],
	            views: {
	                json: views.jsonView
	            }
            }],
	        //---------------------------till here--------------------------------------------

	        //--------------------------------Dashboard APIs----------------------------------

	        "/api/v1/dashboard/channelAdmin": [{
	            method: "GET",
	            action: controllers.dashboardController.getChannelAdminDashboard,
	            middleware: [configurationHolder.security.authority({
	                activity: "Get_ChannelAdmin_Dashboard"
	            })],
	            views: {
	                json: views.jsonView
	            }
	       }],
	        "/api/v1/dashboard/advertisementAdmin": [{
	            method: "GET",
	            action: controllers.dashboardController.getAdvertisementAdminDashboard,
	            middleware: [configurationHolder.security.authority({
	                activity: "Get_AdvertisementAdmin_Dashboard"
	            })],
	            views: {
	                json: views.jsonView
	            }
	       }],
	        "/api/v1/dashboard/revenue": [{
	            method: "GET",
	            action: controllers.dashboardController.getRevenueDashboard,
	            middleware: [configurationHolder.security.authority({
	                activity: "Get_Revenue_Dashboard"
	            })],
	            views: {
	                json: views.jsonView
	            }
	       }],

	        //-------------------------------------------------------------------------------

	        //---------------------------------Report API--------------------------------------

	        "/api/v1/report": [{
	            method: "POST",
	            action: controllers.reportController.createReport,
	            middleware: [configurationHolder.security.authority({
	                activity: "Create_Report"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }, {
	            method: "GET",
	            action: controllers.reportController.getReport,
	            middleware: [configurationHolder.security.authority({
	                activity: "Get_Report"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }, {
	            method: "PUT",
	            action: controllers.reportController.updateStatus,
	            middleware: [configurationHolder.security.authority({
	                activity: "UpdateStatus_Report"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/report/detail/:id": [{
	            method: "GET",
	            action: controllers.reportController.getReportDetail,
	            middleware: [configurationHolder.security.authority({
	                activity: "Generic"
	            })],
	            views: {
	                json: views.jsonView
	            }
	       }],

	        //-----------------------------------------------------------------------------------------

	        //---------------------------------Revenue Margin API--------------------------------------

	        "/api/v1/dashboard/admin": [{
	            method: "PUT",
	            action: controllers.dashboardController.updateRevenueMargin,
	            middleware: [configurationHolder.security.authority({
	                activity: "UpdateMargin"
	            })],
	            views: {
	                json: views.jsonView
	            }
	        }, {
	            method: "GET",
	            action: controllers.dashboardController.getRevenuemargin,
	            middleware: [configurationHolder.security.authority({
	                activity: "getRevenueMargin"
	            })],
	            views: {
	                json: views.jsonView
	            }
	        }],
	        "/api/v1/revenuemargin/viewprice": [{
	            method: "PUT",
	            action: controllers.dashboardController.updateViewPrice,
	            middleware: [configurationHolder.security.authority({
	                activity: "Update_ViewPrice"
	            })],
	            views: {
	                json: views.jsonView
	            }
	        }, {
	            method: "GET",
	            action: controllers.dashboardController.getViewPrice,
	            middleware: [configurationHolder.security.authority({
	                activity: "Get_ViewPrice"
	            })],
	            views: {
	                json: views.jsonView
	            }
	        }],

	        //-----------------------------------------------------------------------------------------

	        //---------------------------------Miscellaneous API---------------------------------------

	        "/api/v1/adTransactionHistory/:kalturaEntryId": [{
	            method: "POST",
	            action: controllers.adTransactionHistoryController.createAdView,
	            middleware: [configurationHolder.security.authority({
	                activity: "create_Ad_View_History"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/vastgenerator/:videoId": [{
	            method: "GET",
	            action: controllers.videoController.generateVastXML,
	            middleware: [configurationHolder.security.authority({
	                activity: "Generic"
	            })],
	            views: {
	                json: views.jsonView
	            }
	       }],

	        "/api/v1/contactus/": [{
	            method: "POST",
	            action: controllers.contactUsController.informSiteAdmin,
	            middleware: [configurationHolder.security.authority({
	                activity: "Generic"
	            })],
	            views: {
	                json: views.jsonView
	            }
	       }],

	        "/api/v1/videoInfoByEntryId/:entryId": [{
	            method: "GET",
	            action: controllers.videoController.videoInfoByEntryIdUrl,
	            middleware: [configurationHolder.security.authority({
	                activity: "Generic"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/generateCSV": [{
	            method: "GET",
	            action: controllers.cSVGeneratorController.generateCSV,
	            middleware: [configurationHolder.security.authority({
	                activity: "Generic"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        //----------------------------------------------------------------------------------------

	        //---------------------------------Cue Point API------------------------------------------

	        "/api/v1/cuepoint": [{
	            method: "POST",
	            action: controllers.cuePointsController.addCuePoints,
	            middleware: [configurationHolder.security.authority({
	                activity: "Add_CuePoint"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }, {
	            method: "GET",
	            action: controllers.cuePointsController.getCuePoints,
	            middleware: [configurationHolder.security.authority({
	                activity: "Get_CuePoint"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }, {
	            method: "PUT",
	            action: controllers.cuePointsController.updateCuePoints,
	            middleware: [configurationHolder.security.authority({
	                activity: "Update_CuePoint"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        //----------------------------------------------------------------------------------------

	        //---------------------------------Payment API------------------------------------------

	        "/api/v1/payment": [{
	            method: "POST",
	            action: controllers.paymentController.channelAdminPayment,
	            middleware: [configurationHolder.security.authority({
	                activity: "Payment"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }, {
	            method: "PUT",
	            action: controllers.paymentController.updatePaymentStatus,
	            middleware: [configurationHolder.security.authority({
	                activity: "Update_Payment_Status"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }, {
	            method: "GET",
	            action: controllers.paymentController.getPayments,
	            middleware: [configurationHolder.security.authority({
	                activity: "Get_Payments"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }],

	        "/api/v1/payment/redeemAmount": [{
	            method: "GET",
	            action: controllers.paymentController.getRedeemAmount,
	            middleware: [configurationHolder.security.authority({
	                activity: "Get_Redeem_Amount"
	            })],
	            views: {
	                json: views.jsonView
	            }
            }]

	        //----------------------------------------------------------------------------------------

	    }
	};
