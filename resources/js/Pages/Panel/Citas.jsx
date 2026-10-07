// resources/js/Pages/Panel/Citas.jsx
import CitasCoordinador from './Citas/CitasCoordinador';
import MisCitas from './Citas/MisCitas';
import CitasTodos from './Citas/CitasTodos';

export default function Citas(props) {
    const { rol, soloLectura } = props;

    if (rol === 'Coordinador') {
        return <CitasCoordinador {...props} />;
    }

    if (rol === 'Formador' && soloLectura) {
        return <CitasTodos {...props} />;
    }

    return <MisCitas {...props} />;
}