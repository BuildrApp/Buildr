import React, {Component} from 'react';
import classNames from "classnames";
import styles from "./SearchBox.module.scss";

class SearchBox extends Component {
    getValue() {
        return this.refs.searchBox.value;
    }

    render() {
        return (
            <div className={classNames(styles.wrapper, this.props.className)}>
                <input type="search" placeholder="Search" className={styles.search} onChange={this.props.onChange} ref="searchBox" />
                <div className={styles.searchIcon}>&#xe906;</div>
            </div>
        );
    }
}

export default SearchBox;