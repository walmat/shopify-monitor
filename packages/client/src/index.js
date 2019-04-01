import ReactDOM from 'react-dom';
import createApp from './App';
import configureStore from './state/configureStore';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/_index.scss';

const store = configureStore();

ReactDOM.render(createApp(store), document.getElementById('root'));
