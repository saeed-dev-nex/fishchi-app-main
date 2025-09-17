import Project from '../models/Project.model.js';

//  Check project created by current user
const checkProjectOwnership = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('پروژه یافت نشد');
  }
  if (project.user.toString() !== userId.toString()) {
    throw new Error('شما مجاز به انجام این عملیات نیستید');
  }
  return true;
};
export default checkProjectOwnership;
