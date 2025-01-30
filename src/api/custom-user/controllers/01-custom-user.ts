module.exports = {
    
    async getUserProgress(ctx) {
      try {
        const { userId, courseId } = ctx.params;
        console.log(userId, courseId);
        console.log("Fetching user progress...");
  
        
        const user = await strapi.db.query('api::custom-user.custom-user').findOne({
          where: { documentId: userId },  
          populate: ['courses_enrolled', 'CourseProgress'],
        });
  
        if (!user) {
          return ctx.notFound('User not found');
        }
  
        const enrolledCourse = user.courses_enrolled.find(course => course.documentId === courseId);
        if (!enrolledCourse) {
          return ctx.notFound('User is not enrolled in this course');
        }
  
        
        const progress = user.CourseProgress?.[courseId];
        if (!progress) {
          return ctx.send({ message: `No progress found for course ${courseId}`, progress: null });
        }
  
        
        const completedLessons = progress.completed_lessons.length;
        const totalLessons = progress.total_lessons;
  
        if (totalLessons === 0) {
          return ctx.send({ message: `Total lessons for course ${courseId} is 0`, progress: null });
        }
  
        const progressPercentage = (completedLessons / totalLessons) * 100;
  
        
        return ctx.send({
          userId: user.id,
          courseId,
          progress: progressPercentage.toFixed(2), 
        });
      } catch (error) {
        console.error(error);
        ctx.internalServerError('An error occurred while fetching user progress');
      }
    },
  
    
    async checkLessonAccess(ctx) {
      try {
        const { userId, courseId, lessonId } = ctx.params;
        console.log(`Checking access for user: ${userId}, course: ${courseId}, lesson: ${lessonId}`);
  
        
        const user = await strapi.db.query('api::custom-user.custom-user').findOne({
          where: { documentId: userId },
          populate: ['courses_enrolled', 'CourseProgress'],
        });
  
        if (!user) {
          return ctx.notFound('User not found');
        }
  
        
        const enrolledCourse = user.courses_enrolled.find(course => course.documentId === courseId);
        if (!enrolledCourse) {
          return ctx.notFound('User is not enrolled in this course');
        }
  
        
        const course = await strapi.db.query('api::course.course').findOne({
          where: { documentId: courseId },
          populate: ['lessons'],
        });
  
        if (!course) {
          return ctx.notFound("Course not found");
        }
  
        
        const lesson = course.lessons.find(lesson => lesson.documentId === lessonId);
        if (!lesson) {
          return ctx.notFound('Lesson not found in this course');
        }
        console.log("lesson",lesson);
  
        
        return ctx.send({ userId: user.id,
            courseId,access: lesson.IsLocked });
      } catch (error) {
        console.error(error);
        ctx.internalServerError('An error occurred while checking lesson access');
      }
    },
    async unlockCourseMaterials(ctx) {
        try {
            const { userId, courseId } = ctx.params;
      
        
        const user = await strapi.db.query('api::custom-user.custom-user').findOne({
          where: { documentId: userId },
          populate: ['courses_enrolled', 'CourseProgress'],
        });
      
        if (!user) {
          return ctx.send("User not found");
        }
      
        const courseEnrolled = user.courses_enrolled.find(course => course.documentId === courseId);
        if (!courseEnrolled) {
          return ctx.send("Course not found");
        }
      
        const progress = user.CourseProgress?.[courseId];
        if (!progress) {
          return ctx.send({ message: `No progress found for course ${courseId}`, progress: null });
        }
      
        const completedLessons = progress.completed_lessons.length;
        const totalLessons = progress.total_lessons;
      
        if (totalLessons === 0) {
          return ctx.send({ message: `Total lessons for course ${courseId} is 0`, progress: null });
        }
      
        const progressPercentage = (completedLessons / totalLessons) * 100;
      
        if (progressPercentage < 30) {
          return ctx.send("Cannot unlock the course material without watching the mandatory videos");
        }
      
        const course = await strapi.db.query('api::course.course').findOne({
          where: { documentId: courseId },
          populate: ['lessons'],
        });
      
        if (!course) {
          return ctx.send("Course not found");
        }
      
        const unlockedLessonsPromises = course.lessons.map(async (lesson) => {
          if (lesson.IsLocked) {
            await strapi.db.query('api::lesson.lesson').update({
              where: { documentId: lesson.documentId },
              data: { IsLocked: false },
            });
          }
        });
      
        await Promise.all(unlockedLessonsPromises);

        await strapi.db.query('api::course.course').update({
            where: { documentId: courseId },
            data: { Unlocked: true },
        });
        
        return ctx.send({
          message: `Course materials for course ${courseId} have been unlocked`,
          unlockedLessons: course.lessons.length,
        });
        } catch (error) {
            console.error(error);
            ctx.internalServerError('An error occurred while trying to unlock the course');
        }
      }
      
  };
  