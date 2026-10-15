import GuestLayout from '@/Layouts/GuestLayout';
import { Link } from '@inertiajs/react';

export default function AvisoDePrivacidad() {
    return (
        <GuestLayout title="Aviso de Privacidad">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 md:p-12">
                <div className="mb-8">
                    <p className="text-sm font-semibold text-[#FF5900] uppercase tracking-wide mb-1">
                        Prepa Anahuac Veracruz - Campus Cordoba-Orizaba
                    </p>
                    <h1 className="text-3xl font-bold text-gray-800">Aviso de Privacidad Integral</h1>
                </div>

                <div className="prose prose-sm max-w-none text-gray-700 space-y-6 leading-relaxed">
                    <p>
                        En cumplimiento a la Ley Federal de Proteccion de Datos Personales en Posesion de los
                        Particulares (en adelante la Ley), de su Reglamento, y de los Lineamientos del Aviso de
                        Privacidad publicados por la Secretaria de Economia, Investigaciones y Estudios Superiores,
                        S.C., pone a disposicion de los Titulares el presente Aviso de Privacidad con el objeto de
                        informarles los alcances y condiciones del tratamiento de sus datos personales unicamente,
                        por lo que hace a la operacion que se lleva a cabo en la region centro del pais, es decir,
                        campus Xalapa y Cordoba, a fin de que esten en posibilidad de tomar decisiones informadas
                        sobre su uso y con ello mantengan el control y disposicion sobre ellos.
                    </p>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-3">
                            Primero. Quien es el Responsable y Donde se Encuentra
                        </h2>
                        <p>
                            Investigaciones y Estudios Superiores, S.C. (en lo sucesivo, la Universidad o la
                            Responsable, indistintamente) con domicilio fiscal para la region centro del pais en:
                            Circuito Arco Sur s/n Lomas Verdes, CP. 91098 Xalapa, Veracruz, Mexico; y Calle
                            Universidad 100, Colonia Rancho San Emigdio, Cordoba, Veracruz, C.P. 94500, es
                            responsable de cuidar la informacion que nos das y protegerla de acuerdo con las leyes
                            sobre datos personales.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-3">
                            Segundo. Que Informacion Recopilamos y Usamos
                        </h2>
                        <p>La Universidad trata informacion personal sobre ti, que pertenece a las siguientes categorias:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Identificacion</li>
                            <li>Caracteristicas fisicas</li>
                            <li>Contacto</li>
                            <li>Academicos</li>
                            <li>Laborales</li>
                            <li>Patrimoniales o financieros, y</li>
                            <li>Migratorios</li>
                        </ul>
                        <p className="mt-3">
                            Si nos das informacion personal de tus familiares o amigos, aceptas que has pedido
                            permiso a esas personas para que les demos tratamiento a su informacion, de acuerdo a
                            las razones que se mencionan en este Aviso de Privacidad.
                        </p>

                        <h3 className="font-bold text-gray-800 mt-4 mb-2">Uso de Datos Personales Sensibles</h3>
                        <p>
                            La Universidad podria solicitarte que proporciones datos personales de aquellos
                            considerados como sensibles, relacionados con las siguientes categorias:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Creencias religiosas, filosoficas o morales, y</li>
                            <li>Salud</li>
                        </ul>
                        <p className="mt-3">
                            Si se trata de informacion de menores de edad, sus padres o tutores legales deben dar
                            permiso para usar y cuidar esa informacion. Esto es conforme a las reglas de
                            representacion dispuestas en el Codigo Civil Federal.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-3">
                            Tercero. Para Que Usamos tus Datos Personales
                        </h2>
                        <p>
                            Queremos que estes seguro y tengas confianza en la Universidad, por eso te explicamos
                            las razones por las que usamos la informacion personal que nos das. De esta forma,
                            podras tomar decisiones informadas, tener control sobre tu informacion y ejercer tus
                            derechos de privacidad y proteccion de datos personales.
                        </p>

                        <h3 className="font-bold text-gray-800 mt-4 mb-2">
                            a) Finalidades primarias
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                            (las necesarias para la existencia, mantenimiento y cumplimiento de la relacion juridica):
                        </p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Realizar tu proceso de ingreso a la Universidad y dar cumplimiento a las obligaciones propias de la relacion Universidad-Alumno</li>
                            <li>Crear tu expediente del perfil del estudiante y asignarle una matricula</li>
                            <li>Asignar clases y horarios, asi como el aula donde se impartiran</li>
                            <li>Identificar al Titular en la aplicacion de examenes</li>
                            <li>Cumplir requisitos y requerimientos de la Secretaria de Educacion y de cualquier otra Autoridad</li>
                            <li>Emitir historiales academicos y validar sus estudios ante las instancias educativas correspondientes</li>
                            <li>Emitir el Titulo profesional</li>
                            <li>Otorgar becas y apoyos financieros, en caso de cumplir los requisitos establecidos</li>
                            <li>Dar acceso a los sistemas institucionales, al portal de internet, a la intranet o red institucional</li>
                            <li>Realizar procesos de inscripciones, reinscripciones, colegiaturas, asi como de cobrar respectivas cuotas y emitir las facturas correspondientes, cuando asi se solicite</li>
                            <li>Generar registros sobre los movimientos del Titular al utilizar los servicios electronicos de la Universidad</li>
                            <li>Registrar y acreditar o validar, la prestacion del servicio social, del servicio becario y practicas profesionales</li>
                            <li>Contratar y/o cancelar el seguro para alumnos</li>
                            <li>Revalidar y acreditar estudios que el Titular haya hecho en otra institucion educativa, asi como, realizar todos los tramites necesarios ante las autoridades escolares correspondientes</li>
                            <li>Registrar todos aquellos eventos y actividades extracurriculares en las que participe el Titular</li>
                            <li>Llevar un control sobre las necesidades especiales de salud que tenga el Titular, para ofrecer una atencion adecuada en caso de emergencia</li>
                            <li>Realizar procesos de cobranza sobre cualquier cuota o concepto que no haya sido pagado a la Universidad por los servicios prestados</li>
                            <li>Brindar atencion, informacion y servicios al Titular sobre su situacion academica, tramites academicos, expedicion de constancias, control de acceso vehicular, reposicion de credencial, recordatorios sobre el calendario escolar, notificaciones de tramites o servicios, tramites de titulacion y seguimiento a quejas</li>
                            <li>Seguimiento a reclamo de seguro de gastos medicos mayores y del programa de educacion garantizada por orfandad</li>
                            <li>Para el control de acceso a las instalaciones de la Universidad, seguridad, proteccion civil y registro</li>
                            <li>Contactar a familiares o terceros en casos de emergencia</li>
                        </ul>

                        <h3 className="font-bold text-gray-800 mt-4 mb-2">
                            b) Finalidades secundarias
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                            (que no son necesarias para la relacion juridica):
                        </p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Apoyar a los egresados para la obtencion de su cedula profesional</li>
                            <li>Informar a tu familia o terceros autorizados sobre tu rendimiento academico y extracurricular</li>
                            <li>Mantener contacto despues de graduarte y para invitarte a eventos de networking y otros eventos</li>
                            <li>Ofrecer servicios de tutorias o mentorias</li>
                            <li>Compartir el curriculum vitae del Titular con instituciones o empresas en las que podria realizar practicas profesionales</li>
                            <li>Gestionar el perfil curricular del Titular en la bolsa de trabajo o en los diversos organismos publicos y privados, empresas y personas fisicas para participar en procesos de seleccion de personal y aplicar a los puestos de trabajo que estas publiquen en bolsa de trabajo de la Universidad</li>
                            <li>Promover eventos culturales, deportivos y sociales de la Universidad</li>
                            <li>Difundir reconocimientos por logros destacados, incluyendo revista oficial de la universidad, periodico oficial, redes sociales, pagina de internet, asi como cualquier otro medio de difusion masiva</li>
                            <li>Para enviar informacion promocional sobre eventos, cursos y otras oportunidades de aprendizaje</li>
                            <li>Para proporcionar servicios de transporte</li>
                            <li>Identificar a los colaboradores del Sorteo Anahuac, informarles del desarrollo y resultados de los sorteos</li>
                            <li>Para invitarte a participar en actividades de recaudacion de fondos o en concursos y encuestas</li>
                        </ul>
                        <p className="mt-3">
                            Las finalidades secundarias no son necesarias para la relacion que tienes con la
                            Universidad. Por lo tanto, puedes negarte o retirar tu consentimiento para que utilicen
                            tus datos con estos fines adicionales.
                        </p>
                        <p className="mt-3">
                            Si no deseas que usemos tus datos para las finalidades secundarias, puedes negarte o
                            revocar tu consentimiento enviando un correo electronico dentro de los proximos cinco
                            dias habiles.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-3">
                            Cuarto. Compartiendo tus Datos con Terceros
                        </h2>
                        <p>
                            En este apartado te informamos con quien compartimos tus datos personales diferente a
                            la Universidad.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-3">
                            Quinto. Como Usamos las Cookies y Otras Tecnologias
                        </h2>
                        <p>
                            Nuestro sitio web utiliza cookies para que todo funcione mejor y para entender como
                            interactuas con la pagina. Existen dos tipos, cookies de analisis, las cuales nos
                            ayudan a conocer cuantas personas nos visitan y como usan el sitio; y las cookies
                            publicitarias, las que nos permiten mostrarte contenido y anuncios mas acorde a tus
                            intereses. Si prefieres no utilizar cookies, puedes desactivarlas en la configuracion
                            de tu navegador. Aun asi, es importante que sepas que algunas funciones del sitio
                            podrian no operar correctamente sin ellas. Para saber mas, visita
                            www.allaboutcookies.org
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-3">
                            Sexto. Como Ejercer tus Derechos ARCO, Revocar el Consentimiento y Limitar su Uso
                        </h2>
                        <p>
                            Si deseas ejercer tus derechos de Acceso, Rectificacion, Cancelacion y Oposicion o
                            bien limitar o revocar el consentimiento sobre el uso de tus datos personales, puedes
                            hacerlo de manera sencilla: primero deberas acreditar tu identidad con una
                            identificacion oficial y, en su caso, la identidad y personalidad de tu representante
                            legal. En segundo lugar, deberas enviar una solicitud por escrito al area
                            correspondiente, indicando claramente que datos deseas revisar o modificar y que
                            derecho deseas ejercer. En caso de que tu solicitud este incompleta, te lo haremos
                            saber para que puedas corregirla dentro de un plazo de 10 dias habiles.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-3">
                            Septimo. Cambios al Aviso de Privacidad
                        </h2>
                        <p>
                            La Universidad Anahuac Veracruz te informa que este aviso de privacidad puede cambiar
                            en el futuro debido a cambios en las leyes o politicas de privacidad. Si hay algun
                            cambio, lo publicaran en su sitio web: https://www.anahuac.mx/veracruz para que puedas
                            estar al tanto de cualquier cambio.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-3">
                            Octavo. Organismo Garante de la Proteccion de los Datos Personales
                        </h2>
                        <p>
                            Si considera que su derecho a la proteccion de datos personales ha sido vulnerado,
                            puedes acudir ante la Unidad de Proteccion de Datos Personales de la Secretaria de
                            Anticorrupcion y Buen Gobierno, en su edificio sede ubicado en Insurgentes Sur 1735
                            Col. Guadalupe Inn 01020 Ciudad de Mexico, Telefono: 5520003000; a traves de su pagina
                            de internet: https://www.gob.mx/buengobierno
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-3">
                            Declaracion de Consentimiento
                        </h2>
                        <p>
                            Otorgo mi consentimiento para que los datos personales sensibles que proporciono sean
                            tratados, durante el tiempo que resulte adecuado, por la Universidad Anahuac Veracruz,
                            institucion de educacion superior que opera a traves de Investigaciones y Estudios
                            Superiores, S.C., asi como para que sean transferidos unicamente en los casos previstos
                            en el presente Aviso de Privacidad, el cual declaro que he leido previamente y
                            reconozco que se encuentra en el siguiente link para mi consulta:
                            https://www.anahuac.mx/veracruz
                        </p>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-[#FF5900] border border-gray-300 hover:border-[#FF5900] px-4 py-2 rounded-xl transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}