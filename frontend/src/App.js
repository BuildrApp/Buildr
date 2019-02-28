import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HideableMenu from "./components/HideableMenu";
import styles from './App.module.scss';
import {generateLink, getCurrentPage} from "./util/serviceWorkerHelpers";
import ErrorBoundary from "./components/ErrorBoundary";
import Badge from "./components/Badge";

class App extends Component {
    static registerController(name, callback) {
        App.unloadedControllers[name] = () => {
            return callback();
        };
    }

    static getRealController(page) {
        if (typeof this.hasController(page) === "function") return page;

        return {
            controller: "Error",
            page: "404"
        }
    }

    static hasController(page) {
        return App.unloadedControllers[page.controller] || App.controllers[page.controller];
    }

    static async getController(page) {
        // Load the controller in case it hasn't been
        await App.loadController(page.controller);
        return App.controllers[page.controller];
    }

    static async loadController(name) {
        if (!App.unloadedControllers[name]) return;
        App.controllers[name] = (await App.unloadedControllers[name]()).default;
        delete App.unloadedControllers[name];
    }

    constructor(props) {
        super(props);

        this.state = {
            menuItems: {
                Home: {
                    icon: 0xe908,
                    link: generateLink("/")
                },
                Repository: {
                    icon: 0xe903,
                    children: {
                        Files: {},
                        Branches: {},
                        Issues: {}
                    }
                },
                Builds: {
                    icon: 0xea2e
                },
                Testing: {
                    icon: 0xe904
                },
                Publish: {
                    icon: 0xe905
                }
            },

            currentPage: App.getRealController(getCurrentPage()),
            currentController: null,
            isPageLoading: true
        };

        window.addEventListener("hashchange", this.hashChange.bind(this));
    }

    hashChange() {
        this.setState({
            currentPage: App.getRealController(getCurrentPage()),
            isPageLoading: true
        });

        App.getController(this.state.currentPage).then(controller => {
            this.setState({
                isPageLoading: false,
                currentController: controller
            });
        });
    }

    componentDidMount() {
        this.hashChange();
    }

    render() {
        const ControllerClass = this.state.currentController;

        return (
            <>
                <ErrorBoundary>
                    <HideableMenu
                        className={styles.sidebar}
                        title={this.props.appName}
                        menuItems={this.state.menuItems}
                    >
                        <Badge title="Zach Barham" subtitle="zoweb" icon="/icon.png" />
                    </HideableMenu>
                </ErrorBoundary>

                {this.state.isPageLoading ?
                    <p>Please wait while the page loads</p> :
                    <ErrorBoundary>
                        <ControllerClass className={styles.main} controller={this.state.currentPage.controller} action={this.state.currentPage.action} />
                    </ErrorBoundary>
                }
            </>
        );
    }
}

App.propTypes = {
    appName: PropTypes.string.isRequired
};

App.controllers = {};
App.unloadedControllers = {};

App.registerController("Error", () => import("./controllers/Error"));
App.registerController("Home", () => import("./controllers/Home"));

export default App;
