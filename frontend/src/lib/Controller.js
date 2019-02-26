import React, {Component} from 'react';
import App from "../App";
import styles from "./Controller.module.scss";

class Controller extends Component {
    constructor(props) {
        super(props);
        this.scopedMethods = [];
    }

    render() {
        if (!this.hasAction()) {
            const ControllerClass = App.getController({controller: "Error"});
            return <ControllerClass controller="Error" action="404"/>;
        }

        const page = this.getAction();
        const result = page();

        if (typeof result === "undefined")
            throw new TypeError(`Nothing was returned from render of ${this.props.controller}/${this.props.action}`);

        return (
            <div className={styles.container}>{result}</div>
        );
    }

    getAction(name = this.props.action) {
        return this[name] || this["$" + name] || this.getScopedMethod(name);
    }

    hasAction(name = this.props.action) {
        return typeof this.getAction(name) !== "undefined";
    }

    /**
     * Add a scoped method
     * @param {RegExp} scope - Matches against the action
     * @param {Function} method
     */
    addScopedMethod(scope, method) {
        this.scopedMethods.push({scope, method});
    }

    getScopedMethod(name) {
        return this.scopedMethods
            .map(it => ({
                match: it.scope.exec(name),
                method: it.method
            }))
            .filter(it => it.match !== null)
            .map(it => it.method.bind(...it.match))[0];
    }
}

export default Controller;