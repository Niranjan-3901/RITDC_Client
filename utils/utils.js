import { Ionicons, MaterialCommunityIcons, MaterialIcons, Feather,AntDesign, FontAwesome5, FontAwesome} from '@expo/vector-icons';
const iconLibraries = {
    MaterialIcons,
    FontAwesome,
    Ionicons,
    AntDesign,
    FontAwesome5,
    Feather,
    MaterialCommunityIcons,
  }

  export const renderIcon = ({ library, iconName, size = 24, color = 'black' }) => {
  
    const IconComponent = iconLibraries[library];
  
    if (!IconComponent) {
      console.warn(`Library ${library} not found`);
      return null;
    }
  
    return <IconComponent name={iconName} size={size} color={color} />;
  };
  
