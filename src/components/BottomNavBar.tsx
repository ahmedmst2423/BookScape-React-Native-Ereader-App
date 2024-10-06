import * as React from 'react';
import { BottomNavigation, BottomNavigationProps} from 'react-native-paper';

type RouteType = {
  key: string;
  title: string;
  icon: string;
};

type Props = {
  routes: RouteType[];
  index: number;
  onIndexChange: (index: number) => void;
  renderScene: (props: { route: any }) => React.ReactNode;
};

const MyBottomNavigation: React.FC<Props> = ({ routes, index, onIndexChange, renderScene }) => {
  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={onIndexChange}
      renderScene={renderScene}
    />
  );
};

export default MyBottomNavigation;
