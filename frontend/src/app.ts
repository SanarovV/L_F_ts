import './styles/style.scss'
import './styles/adaptive.scss'
import {Router} from "./router";

class App {
    constructor() {
        new Router();
    }
}
(new App());