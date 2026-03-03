import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { useZip } from "../context/zipContext";
import zipToCounty from '../data/zipCodesAndCounties';
import { styles } from "../styles";

export default function SelectionScreen(){
const router = useRouter();
const { zip } = useZip();
const county = zipToCounty[zip];

    return(
        <View style={{...styles.container, backgroundColor: '#ffffff'}}>
            <Text style={{ fontFamily: 'Helvetica',fontSize: 26, textAlign: "center", fontWeight: "bold" }}>Select A Vehicle Type</Text>
            <View
  style={{
    alignSelf: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 22,
  }}
>
  <Text style={{ fontSize: 13, fontWeight: "700", color: "#444" }}>
    ZIP {zip}
  </Text>
</View>

            <Pressable 
             style={{
                paddingVertical: 20,
                paddingHorizontal: 20,
                borderRadius: 12,
                marginBottom: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#e3ded9',
                height: 180,
                overflow: 'hidden',
            }}
            onPress={() => router.push("/gas")}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
                  <Text style={{ fontFamily: 'Helvetica',fontSize: 28, fontWeight: "bold" }}>Gas</Text>
                          <Text style={{ marginTop: 6, fontSize: 13, color: "#444" }}>
          Tap to browse
        </Text>
                </View>
                <Image 
                  source={require('./images/gas-example.jpg')}
                  style={{ width: 270, height: 180, marginRight: -58 }}
                  resizeMode="contain"
                />
            </Pressable>

            <Pressable 
             style={{
                paddingVertical: 20,
                paddingHorizontal: 20,
                borderRadius: 12,
                marginBottom: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#e3ded9',
                height: 180,
                overflow: 'hidden',
            }}
            onPress={() => router.push("/hybrid")}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
                  <Text style={{ fontFamily: 'Helvetica',fontSize: 28, fontWeight: "bold" }}>Hybrid</Text>
                          <Text style={{ marginTop: 6, fontSize: 13, color: "#444" }}>
          Tap to browse
        </Text>
                </View>
                <Image 
                  source={require('./images/prius-example.jpg')}
                  style={{ width: 270, height: 180, marginRight: -58 }}
                  resizeMode="contain"
                />
            </Pressable>

             <Pressable 
             style={{
                paddingVertical: 20,
                paddingHorizontal: 20,
                borderRadius: 12,
                marginBottom: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#e3ded9',
                height: 180,
                overflow: 'hidden',
            }}
            onPress={() => router.push("/electric")}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
                  <Text style={{ fontFamily: 'Helvetica',fontSize: 28, fontWeight: "bold" }}>Electric</Text>
                          <Text style={{ marginTop: 6, fontSize: 13, color: "#444" }}>
          Tap to browse
        </Text>
                </View>
                <Image 
                  source={require('./images/electric-example.jpg')}
                  style={{ width: 270, height: 180, marginRight: -58 }}
                  resizeMode="contain"
                />
            </Pressable>
         </View>
    );
};
