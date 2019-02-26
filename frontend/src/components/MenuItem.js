import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from "classnames";
import styles from "./MenuItem.module.scss";

class MenuItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            height: "2.6em"
        };
    }

    getHeight() {
        return this.refs.root.scrollHeight;
    }

    toggleVisibility() {
        this.setState(state => ({
            open: !state.open,
            height: state.open ? "" : this.getHeight() + "px"
        }));
    }

    open() {
        this.setState({
            open: true,
            height: this.getHeight() + "px"
        });
    }

    close() {
        this.setState({
            open: false,
            height: ""
        });
    }

    render() {
        return (
            <li
                ref="root"
                className={classNames(styles.item, {[styles.open]: this.state.open}, {[styles.containsItems]: this.props.children})}
                style={{height: this.state.height}}>
                <a href={this.props.link || "#"} onClick={this.props.children ? e => {e.preventDefault(); this.toggleVisibility()}: null}>
                    {this.props.icon ? <span className={styles.icon}>{this.props.icon}</span> : null }
                    {this.props.name}
                </a>

                {this.props.items ? generateMenuItems(this.props.items) : null}

                {this.props.children ? <ul className={styles.children}>{this.props.children}</ul> : null}
            </li>
        )
    }
}

MenuItem.propTypes = {
    name: PropTypes.string.isRequired,
    icon: PropTypes.string,
    link: PropTypes.string
};

export default MenuItem;

export function generateMenuItems(from) {
    if (typeof from === "undefined" || from === null) return from;
    return Object.keys(from)
        .map(name => {
            const object = from[name];
            object.name = name;
            return object;
        })
        .map(el => (
            <MenuItem name={el.name} icon={String.fromCharCode(el.icon)} link={el.link} children={generateMenuItems(el.children)} key={el.name} />
        ));
}