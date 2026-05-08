import styled from 'styled-components/native';
import { Dimensions, View } from 'react-native';

const { width } = Dimensions.get('window');

const PIXEL_FONT = 'DOSIyagiBoldface';
const OUTLINE_COLOR = '#FF5C8D';

export const Container = styled.View`
  flex: 1;
  background-color: transparent;
`;

export const GreenBox = styled.View`
  height: 40px;
  background-color: #C6EB8D;
  width: 100%;
`;

export const MainContent = styled.View`
  flex: 1;
  position: relative;
  overflow: hidden;
  align-items: center; 
  justify-content: center;
  width: 100%;
  padding-bottom: 30px;
`;

interface StarProps {
  $top?: number;
  $right?: number;
  $size?: number;
  $rotate?: string;
}

export const StarContainer = styled(View) <StarProps>`
  position: absolute;
  top: ${(props: StarProps) => props.$top ?? 0}px;
  right: ${(props: StarProps) => props.$right ?? 0}px;
  width: ${(props: StarProps) => props.$size ?? 100}px;
  height: ${(props: StarProps) => props.$size ?? 100}px;
  z-index: 1;
  opacity: 0.15;
`;

export const Notice = styled.Text`
  margin-top: 55px;
  width: 100%;
  text-align: center;
  font-size: 14px; 
  color: #FF5C8D;
  font-family: ${PIXEL_FONT};
  text-shadow-color: #ffffff;
  text-shadow-offset: 0px 0px;
  text-shadow-radius: 1.5px;
  z-index: 10;
`;

export const CenterSection = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-horizontal: 20px;
  margin-top: -50px; 
`;

export const Logo = styled.View`
  margin-bottom: 25px;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

export const SubTitle = styled.Text`
  font-size: 20px; 
  color: #fafafa;
  line-height: 42px;
  text-align: center;
  font-family: ${PIXEL_FONT};
  text-shadow-color: ${OUTLINE_COLOR};
  text-shadow-offset: 1px 1px;
  text-shadow-radius: 0.5px;
  width: 100%;
`;

export const ButtonSection = styled.View`
  padding-horizontal: 20px;
  padding-bottom: 60px;
  gap: 15px;
  width: 100%;
  align-items: center;
`;

export const LoginButton = styled.TouchableOpacity`
  padding-vertical: 8px;
  align-items: center;
  width: 100%;
`;

export const LoginButtonText = styled.Text`
  font-size: 24px; 
  color: #ffffff;
  font-family: ${PIXEL_FONT};
  text-shadow-color: ${OUTLINE_COLOR};
  text-shadow-offset: 1px 1px;
  text-shadow-radius: 0.5px;
`;

// --- Home Screen Styles ---

export const Header = styled.View`
  align-items: center;
  width: 100%;
`;

export const StepNumber = styled.Text`
  font-size: 20px;
  color: #FF8CB6;
  font-family: ${PIXEL_FONT};
  margin-bottom: 15px;
`;

export const Title = styled.Text`
  font-size: 24px;
  color: #FF8CB6;
  font-family: ${PIXEL_FONT};
`;

export const WheelSection = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-horizontal: 40px;
  margin-vertical: 40px;
`;

export const ArrowButton = styled.TouchableOpacity`
  padding: 10px;
`;

export const ArrowText = styled.Text`
  font-size: 30px;
  color: #FF8CB6;
  font-family: ${PIXEL_FONT};
`;

export const FooterAction = styled.TouchableOpacity`
  margin-top: 20px;
  align-items: center;
  width: 100%;
`;

export const FooterActionText = styled.Text`
  font-size: 20px;
  color: #FF8CB6;
  font-family: ${PIXEL_FONT};
`;