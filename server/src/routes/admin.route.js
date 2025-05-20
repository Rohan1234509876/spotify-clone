import {Router} from 'express';
import { protectRoute, requireAdmin } from '../../middleware/auth.middleware.js';
import { checkAdmin, createAlbum, createSong, deleteAlbum, deleteSong } from '../controller/admin.controller.js';

const router = Router();

router.get('/check',protectRoute,requireAdmin,checkAdmin);

router.post('/song',protectRoute,requireAdmin,createSong);
router.delete('/song/:id',protectRoute,requireAdmin,deleteSong);

router.post('/albums',protectRoute,requireAdmin,createAlbum);
router.delete('/albums/:id',protectRoute,requireAdmin,deleteAlbum);







export default router;