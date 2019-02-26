import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from "./RepositoryInfo.module.scss";

class RepositoryInfo extends Component {
    render() {
        return (
            <div>
                <a className={styles.title}>{this.props.name}</a>
            </div>
        );
    }
}

RepositoryInfo.propTypes = {
    name: PropTypes.string
};

export default RepositoryInfo;