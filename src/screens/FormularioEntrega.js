import React, {useEffect, useState} from 'react';
import {
  AppState,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import {BASE_URL} from '../config';
import {Icon} from 'react-native-elements';
import {TextInput} from 'react-native-gesture-handler';
import {UserContext} from '../context/UserContext';
import {LentesHandler} from '../components/LentesHandler';
import {EstatusContext} from '../context/EstatusContext';
import {CommonActions} from '@react-navigation/native';

export default function Formulario({route, navigation}) {
  // const [cantidad, setCantidad] = useState(0);
  const [articulos, setArticulos] = useState([]);
  const [entregas] = useState([]);
    //AuthFlow
    const {estado} = React.useContext(EstatusContext);
    const {authFlow} = React.useContext(EstatusContext);
  // const {idTienda, nombreTienda} = route.params;
  const idTienda = 26;
  const user = React.useContext(UserContext);

  //asi se envia para POST (server recibe modelo)
  async function insertFormulario(navigation, cant) {
    if (cant <= 0) {
      Alert.alert('Verifique datos', 'Ingrese cantidad valida', [
        {text: 'Aceptar'},
      ]);
      return;
    }

    const formulario = {
      idTienda: 26, // agregar
      entregas: entregas,
      idViaje: 1, //agregar
      cant: cant, //agregar
      idArticulo: 3, //agregar
      idUsuario: 2000433, //agregar
    };

    console.log(formulario);

    const result = await axios.post(
      `${BASE_URL}Tiendas/InsertaFormCapt`,
      formulario,
    );

    if (result.data) {
      Alert.alert('Listo', 'Se han registrado correctamente', [
        {
          text: 'Aceptar',onPress:() =>( authFlow.setEstatus(10, 26, 1, 20), authFlow.getEstatus(1))
          // onPress: () => navigation.navigate('MostradorDespues'),
        },
      ]);
    } else {
      alert('error');
    }

    console.log(result.data);
    return result;
  }

  const handleCant = (id, cant) => {
    if (entregas.length > 0) {
      for (var i = 0; i < entregas.length; i++) {
        if (entregas[i].id == id) {
          entregas[i].cant = cant;
          console.log(`Actualiza: ${JSON.stringify(entregas)}`);

          break;
        }
      }
    } else {
      for (let i = 0; i < articulos.length; i++) {
        entregas.push({id: articulos[i].Id, cant: 0});
      }
      console.log(entregas);
    }
  };

  const GetArticulos = async (idTienda) => {
    const params = {
      idUsuario: 1, //agregar id usuario REAL
    };
    // console.log(idTienda);

    try {
      await axios
        .get(`${BASE_URL}Articulos/GetArticulos`, {params})
        .then((res) => {
          const result = res.data;
          let jsonArticulos = JSON.parse(result);

          setArticulos(jsonArticulos);
          // console.log('articulos');
          // console.log(jsonArticulos);

          // setIsLoading(false);
        });
    } catch (e) {
      alert(`Ocurrio un error ${e}`);
    }
  };

  useEffect(() => {
    entregas.length = 0;
    GetArticulos(idTienda);

    return () => {};
  }, []);

  //Este Este useEffect se detona cuando se modifica el estado del viaje
  useEffect(async () => {
    console.log('PANTALLA');
    console.log(estado.Modulo);
    //navega a la ultima pantalla en que se encontraba el usuario
    navigation.dispatch(
      CommonActions.navigate({
        name: estado.Modulo,
        // params: {
        //   user: 'jane',
        // },
      }),
    );
  }, [estado]);

  useEffect(() => {
    console.log(`Entregas: ${JSON.stringify(entregas)}`);
  }, [entregas]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Text style={{color: 'white'}}>{user.name}</Text>,
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>OXXO</Text>

          {/* <Text style={styles.header}>{nombreTienda}</Text> */}
        </View>

        <Text style={{padding: 20, fontWeight: 'bold'}}>
          Tercer paso: Deja productos a tienda
        </Text>

        <View style={{alignItems: 'center'}}>
          <Text style={{fontStyle: 'italic'}}>
            <Icon
              name="info-circle"
              type="font-awesome"
              size={15}
              color="blue"></Icon>{' '}
            Captura las cantidades entregadas de cada modelo
          </Text>
        </View>
      </View>
      
      <View style={styles.articulosContainer}>
        <FlatList
          data={articulos}
          keyExtractor={({id}, index) => id}
          renderItem={({item}) => (
            <LentesHandler
              handleCant={handleCant}
              key={item.id}
              id={item.Id}
              nombre={item.Nombre}></LentesHandler>
          )}></FlatList>
      </View>
     
      <View style={styles.btnSubmitContainer}>
        <TouchableOpacity
          style={styles.btnSubmit}
          onPress={() => insertFormulario(navigation)}
          // onPress={() => navigation.navigate('MostradorDespues')}
        >
          <Text style={styles.btnSubmitText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  articulosContainer: {
   flex:2
  },
  headerContainer:{
    flex:1,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
  },
  btnSubmit: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'rgb(27,67,136)',
  },
  btnSubmitContainer: {
    flex:.5,
    padding: 20,
  },
  btnSubmitText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});