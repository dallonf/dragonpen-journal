import React from 'react';
import { Switch, Route } from 'react-router-dom';
import JournalPage from './pages/journal/JournalPage';

const Routes = () => (
  <Switch>
    <Route exact={true} path="/">
      <JournalPage />
    </Route>
    <Route exact={true} path="/edit/:id">
      <JournalPage mode="edit" />
    </Route>
  </Switch>
);

export default Routes;
