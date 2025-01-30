module.exports = {
    routes: [
      {
        method: 'GET', // HTTP method (GET, POST, PUT, DELETE, etc.)
        path: '/custom-users/:userId/progress/:courseId', // The route URL
        handler: '01-custom-user.getUserProgress', // The controller and function
        config: {
          auth: false, // Set to true if authentication is required
        },
      },
      {
        method: 'GET',
        path: '/custom-users/check-lesson-access/:userId/:courseId/:lessonId',
        handler: '01-custom-user.checkLessonAccess',
        config: {
          policies: [],
          middlewares: [],
        },
      },
      {
        method: 'GET',
        path: '/custom-users/unlock-materials/:userId/:courseId',
        handler: '01-custom-user.unlockCourseMaterials', // The controller and function
        config: {
          auth: false, // Set to true if authentication is required
          policies: [],
          middlewares: [],
        },
      },
    ],
    
  };