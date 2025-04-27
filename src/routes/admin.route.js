import {Router} from 'express';
import { protectRoute, requireAdmin } from '../../middleware/auth.middleware.js';
import { checkAdmin, createAlbum, createSong, deleteALbum, deleteSong } from '../controller/admin.controller.js';

const router = Router();

router.get('/check',protectRoute,requireAdmin,checkAdmin);

router.post('/song',protectRoute,requireAdmin,createSong);
router.delete('/song/:id',protectRoute,requireAdmin,deleteSong);

router.post('/albums',protectRoute,requireAdmin,createAlbum);
router.post('/albums/:id',protectRoute,requireAdmin,deleteALbum);







export default router;