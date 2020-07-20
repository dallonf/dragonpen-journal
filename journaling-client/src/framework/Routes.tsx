import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Journal from '../pages/journal/Journal';

const Routes = () => (
  <Switch>
    <Route exact={true} path="/">
      <Journal />
    </Route>
  </Switch>
);

export default Routes;
