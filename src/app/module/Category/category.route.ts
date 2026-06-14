import { Router } from "express";
import { CategoryControllers } from "./category.controller";

const router = Router();

router.get("/", CategoryControllers.getAllCategories);

export const CategoryRoutes = router;
export default CategoryRoutes;
