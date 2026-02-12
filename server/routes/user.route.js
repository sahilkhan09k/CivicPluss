import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getUserProfile, getUserIssues, updateUserProfile } from '../controllers/user.controller.js';

const router = Router();

router.route('/profile').get(verifyJWT, getUserProfile);
router.route('/profile').put(verifyJWT, updateUserProfile);
router.route('/issues').get(verifyJWT, getUserIssues);

export default router;