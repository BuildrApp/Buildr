import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from "./Badge.module.scss";

class Badge extends Component {
    render() {
        return (
            <div className={styles.container}>
                <img src={this.props.icon} alt={this.props.title + "'s profile"} className={styles.icon} />
                <p className={styles.title}>{this.props.title}</p>
                <p className={styles.subtitle}>{this.props.subtitle}</p>
            </div>
        );
    }
}

Badge.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    icon: PropTypes.string
};

export default Badge;