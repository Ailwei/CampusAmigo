import { Router } from "express";
import { createUserController,getMeController ,forgotPasswordController, resetPasswordController, loginController, googleLoginController, deleteAccountController } from "../controller/authController";
import { saveClassesController, saveTimetableController,getWeeklyCalendarController, getSummaryController } from "../controller/onBoardingController";
import { addAssignmentController,getAssignmentsController,updateAssignmentProgressController, } from "../controller/assignmentsController";
import { addExamController, getExamsController } from "../controller/examasController";
import { addRevisionController, getRevisionsController, updateRevisionProgressController } from "../controller/revisionsController";
import { authMiddleware } from "../midlwWare/middleWare";
import { addAssignmentTaskController, deleteAssignmentTaskController, getAssignmentTasksController, updateAssignmentTaskProgressController } from "../controller/addAssignmentController";
import { saveClassController, getTimetableController,saveSubjectController, getSubjectsController, updateSubjectController , updateClassSlotController,  deleteSubjectController } from "../controller/timetableController"; 



const router = Router();

router.post("/auth/register",createUserController)
router.post("/auth/login", loginController)
router.post("/auth/google", googleLoginController);
router.post("/auth/forgot-password", forgotPasswordController);
router.post("/auth/reset-password", resetPasswordController);
router.get("/user/me", authMiddleware,getMeController);

router.post("/onboarding/add-class",authMiddleware, saveClassesController);
router.post("/onboarding/add-time-table",authMiddleware,saveTimetableController);
router.post("/onboarding/summary", authMiddleware, getSummaryController);

router.get("/onboarding/summary", authMiddleware, getSummaryController);

router.get("/onboarding/view-time-table", authMiddleware, getWeeklyCalendarController);

router.post("/assignment/add-assignment",authMiddleware, addAssignmentController);
router.get("/assignment/get-assignment",authMiddleware, getAssignmentsController);
router.patch("/assignment/update-progress",authMiddleware, updateAssignmentProgressController);

router.post("/exam/add-exam",authMiddleware, addExamController);
router.get("/exam/get-exam", authMiddleware, getExamsController);

router.post("/revision/add-revision", authMiddleware, addRevisionController);
router.get("/revision/get-revision", authMiddleware,getRevisionsController);
router.patch("/revision/update-progress",authMiddleware, updateRevisionProgressController);


router.get("/assignment/get-tasks", authMiddleware, getAssignmentTasksController);
router.post("/assignment/add-task", authMiddleware, addAssignmentTaskController);
router.patch("/assignment/update-task-progress", authMiddleware,  updateAssignmentTaskProgressController );
router.delete("/assignment/delete-task", authMiddleware,  deleteAssignmentTaskController);


router.post("/timetable/add-subjects", authMiddleware, saveSubjectController);
router.post("/timetable/add-classes", authMiddleware, saveClassController);
router.get("/timetable/get-classes", authMiddleware, getTimetableController);
router.get("/timetable/view-time-table", authMiddleware, getWeeklyCalendarController);
router.get("/timetable/summary", authMiddleware, getSummaryController);

router.get("/subjects/get-subjects", authMiddleware, getSubjectsController)
router.put("/timetable/update-subject", authMiddleware, updateSubjectController);
router.put("/timetable/update-class-slot", authMiddleware, updateClassSlotController)
router.delete("/subjects/delete-subject", authMiddleware, deleteSubjectController)

router.delete("/auth/delete-account",authMiddleware,deleteAccountController);
export default router;
