import React, {Component} from 'react';
import PropTypes from "prop-types";
import styles from "./MultiColumn.module.scss";

class MultiColumn extends Component {
    render() {
        return (
            <div
                className={styles.root}
                style={{gridTemplateColumns: React.Children.toArray(this.props.children).map(() => "1fr").join(" ")}}>
                {this.props.children}
            </div>
        );
    }
}

export class Column extends Component {
    render() {
        return (
            <div>
                <div className={styles.columnTitle}>{this.props.title}</div>
            </div>
        );
    }
}

Column.propTypes = {
    title: PropTypes.string
};

export default MultiColumn;