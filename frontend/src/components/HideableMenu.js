import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from "classnames";
import Fuse from "fuse.js";
import SearchBox from "./SearchBox";
import styles from "./HideableMenu.module.scss";
import {generateMenuItems} from "./MenuItem";
import ErrorBoundary from "./ErrorBoundary";

/**
 * Generate a data object from a MenuItem
 * @param {MenuItem} menuItem
 */
function generateDataObject(menuItem) {
    return {
        name: menuItem.props.name,
        component: menuItem,
        visible: true,
        children: React.Children.map(menuItem.props.children, component => generateDataObject(component)) || []
    };
}

function flattenItems(items) {
    const target = [];
    for (const item of items) {
        target.push(item);
        target.push(...flattenItems(item.children));
    }
    return target;
}

function generateVisibleItems(items) {
    if (!items.length) return [];

    const target = [];
    for (const item of items) {
        if (isVisible(item)) {
            const clone = {
                name: item.name,
                component: item.component,
                visible: item.visible,
                children: generateVisibleItems(item.children)
            };
            target.push(clone);
        }
    }
    return target;
}

function isVisible(item) {
    if (!item) return false;
    if (item instanceof Array) return item.some(isVisible);
    return item.visible || isVisible(item.children);
}

class HideableMenu extends Component {
    constructor(props) {
        super(props);

        let itemSources = this.props.menuItems ? generateMenuItems(this.props.menuItems) : this.props.children;
        this.items = React.Children.map(itemSources, component => generateDataObject(component));
        this.flattenedItems = flattenItems(this.items);
        this.fuse = new Fuse(this.flattenedItems, {
            keys: ["name"]
        });

        this.state = {
            items: this.items,
            searchIsEmpty: false,
            open: true
        };
    }

    search() {
        const query = this.refs.searchBox.getValue();
        if (!query) {
            this.flattenedItems.forEach(item => item.visible = true);
            this.setState({items: this.items});
            return;
        }

        const searchResult = this.fuse.search(query);

        for (const item of this.flattenedItems) {
            item.visible = searchResult.indexOf(item) !== -1;
        }

        const items = this.items.filter(it => isVisible(it));

        this.setState(prev => ({
            items,
            searchIsEmpty: items.length === 0,
            open: prev.open,
        }));
    }

    toggleVisibility() {
        this.setState(prev => ({
            items: prev.items,
            open: !prev.open,
            searchIsEmpty: prev.searchIsEmpty
        }), this.updateMenuItemEvents);
    }

    handleItemClick(e) {
        if (this.state.open) return;

        e.preventDefault();

        this.setState(prev => ({
            items: prev.items,
            open: true,
            searchIsEmpty: prev.searchIsEmpty
        }), this.updateMenuItemEvents);
    }

    updateMenuItemEvents() {
        /*for (const item of this.flattenedItems) {
            item.setClickToToggle(!this.state.open);
        }*/
    }

    render() {
        return (
            <div
                className={classNames(styles.sidebar, this.props.className, {[styles.closed]: !this.state.open})}>
                <div className={styles.title} onClick={this.toggleVisibility.bind(this)}>{this.props.title}</div>
                <ErrorBoundary>
                    <div>
                        <SearchBox ref="searchBox" className={styles.search} onChange={this.search.bind(this)}/>
                        <ul className={styles.children} onClick={this.handleItemClick.bind(this)}>
                            {generateVisibleItems(this.state.items).map(item => item.component)}
                            {this.state.searchIsEmpty ? <p className={styles.emptySearch}>Nothing found from search</p> : null}
                        </ul>
                    </div>
                    { this.props.menuItems && <div className={styles.lower}>{this.props.children}</div> }
                </ErrorBoundary>
            </div>
        );
    }
}

HideableMenu.propTypes = {
    title: PropTypes.string.isRequired
};

export default HideableMenu;