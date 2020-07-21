import React from 'react';
import { Switch, Route } from 'react-router-dom';
import JournalPage from './pages/journal/JournalPage';
import AddPage from './pages/add/AddPage';
import EditPage from './pages/edit/EditPage';

const Routes = () => (
  <Switch>
    <Route exact={true} path="/">
      <JournalPage />
    </Route>
    <Route exact={true} path="/add">
      <AddPage />
    </Route>
    <Route exact={true} path="/edit/:id">
      <EditPage />
    </Route>
  </Switch>
);

export default Routes;
