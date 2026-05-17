import { Router, type IRouter } from "express";
import healthRouter from "./health";
import toolsRouter from "./tools";
import executionsRouter from "./executions";
import pluginsRouter from "./plugins";
import dashboardRouter from "./dashboard";
import intentRouter from "./intent";

const router: IRouter = Router();

router.use(healthRouter);
router.use(toolsRouter);
router.use(executionsRouter);
router.use(pluginsRouter);
router.use(dashboardRouter);
router.use(intentRouter);

export default router;
