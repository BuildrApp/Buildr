import React from 'react';
import Controller from "../lib/Controller";
import MultiColumn, {Column} from "../components/MultiColumn";
import RepositoryInfo from "../components/RepositoryInfo";

class Home extends Controller {
    Index() {
        return (
            <div>
                <h2>Repositories</h2>
                <RepositoryInfo name="Test Repository" />
            </div>
        );
    }
}

export default Home;