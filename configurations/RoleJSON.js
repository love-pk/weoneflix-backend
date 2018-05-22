var RoleJson = [
    {
        name: "Role_Anonymous",
        activities: ["Login", "Register", "Get_Videos", "Generic", "Forgot_Password", "Get_Comments", "Change_Password"]
        },
    {
        name: "Role_User",
        activities: ["Login", "Register", "Logout", "Forgot_Password", "Change_Password", "Get_Videos", "Play_Video", "Subscribe_Channel", "UnSubscribe_Channel", "Rate_Video", "Generic", "Get_AllChannels", "Get_Video_Rating", "Get_Comments", "Create_Comment", 'Increment_Views', 'create_Ad_View_History', 'Create_Report', 'Get_User_Detail', 'Update_Profile']
        },
    {
        name: "Role_Site_Admin",
        activities: ["Login", "Logout", "Register", "Forgot_Password", "Change_Password", "Get_Videos", "Play_Video", "Update_Role", "Create_Channel", "Delete_Channel", "Add_Video", "Delete_Video", "Subscribe_Channel", "UnSubscribe_Channel", "Get_AllChannels", "Rate_Video", "Generic", "Create_Channel-Admin", "Get_Video_Rating", "Get_Comments", "Create_Comment", "Upload_Video", "Update_Channel", "Update_Video", 'Increment_Views', "Add_Advertisement", "update_Advertisement", "Get_Advertisement", "delete_Advertisement", "Update_Video_Images", "GetAllUsers", "getAdminDashboard", "Get_Revenue_Dashboard", "Upload_Video_Banner", "Set_HeadBanner_Videos", 'create_Ad_View_History', 'Create_Report', 'Get_Report', 'UpdateStatus_Report', 'Create_Transaction', 'Get_Transaction', "UpdateMargin", "getRevenueMargin", 'Get_User_Detail', 'Update_Profile', 'Update_ViewPrice', 'Get_ViewPrice', 'Add_CuePoint', 'Get_CuePoint', 'Update_CuePoint', 'Search_Video', 'Search_Advertisement', 'Search_User', 'Search_Channel', 'Payment', 'Update_Payment_Status', 'Get_Payments', 'Get_Redeem_Amount']
        },
    {
        name: "Role_Channel_Admin",
        activities: ["Login", "Logout", "Register", "Forgot_Password", "Change_Password", "Get_Videos", "Play_Video", "Create_Channel", "Add_Video", "Delete_Video", "Play_Video", "Subscribe_Channel", "UnSubscribe_Channel", "Get_AllChannels", "Rate_Video", "Generic", "Get_Video_Rating", "Get_Comments", "Create_Comment", "Upload_Video", "Delete_Channel", "Update_Channel", "Update_Video", 'Increment_Views', "Add_Advertisement", "update_Advertisement", "Get_Advertisement", "delete_Advertisement", "Update_Video_Images", "Get_ChannelAdmin_Dashboard", "Upload_Video_Banner", 'create_Ad_View_History', 'Create_Report', 'Get_User_Detail', 'Update_Profile', 'Search_Video', 'Search_Channel', 'Payment', 'Get_Redeem_Amount', 'Get_ViewPrice']
            },
    {
        name: "Role_Site_Moderator",
        activities: ["Login", "Logout", "Register", "Forgot_Password", "Change_Password", "Get_Videos", "Play_Video", "Create_Channel", "Delete_Channel", "Add_Video", "Delete_Video", "Subscribe_Channel", "UnSubscribe_Channel", "Rate_Video", "Generic", "Create_Channel-Admin", "Get_AllChannels", "Get_Video_Rating", "Get_Comments", "Create_Comment", "Upload_Video", "Update_Channel", "Update_Video", 'Increment_Views', "Add_Advertisement", "update_Advertisement", "Get_Advertisement", "delete_Advertisement", "Update_Video_Images", "GetAllUsers", "getAdminDashboard", "Upload_Video_Banner", 'create_Ad_View_History', 'Create_Report', 'Get_Report', 'Get_User_Detail', 'Update_Profile']

            },
    {
        name: "Role_Advertisement_Admin",
        activities: ["Login", "Logout", "Register", "Forgot_Password", "Change_Password", "Get_Videos", "Play_Video", "Create_Channel", "Add_Video", "Delete_Video", "Play_Video", "Subscribe_Channel", "UnSubscribe_Channel", "Get_AllChannels", "Rate_Video", "Generic", "Get_Video_Rating", "Get_Comments", "Upload_Video", 'Increment_Views', "Add_Advertisement", "update_Advertisement", "Get_Advertisement", "delete_Advertisement", "Update_Video_Images", "Get_AdvertisementAdmin_Dashboard", 'create_Ad_View_History', 'Create_Report', 'Get_User_Detail', 'Update_Profile', 'Get_ViewPrice', 'Search_Advertisement', 'Payment']
            }
];


module.exports.RoleJson = RoleJson
