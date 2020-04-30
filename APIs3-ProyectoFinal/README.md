# API para Cloud Object Storage

## Configuración del proyecto
```
npm install
```

---

Nota: Debe proporcionar sus credenciales en el archibo de configuración **localdev-config** para la conexión con el servicio.


---

### Ejecución en modo desarrollo
```
npm run dev
```

### Ejecución del API
```
npm run start
```

### Prueba del API

Debe enviar una petición **POST** a la la ruta **http://localhost:3000/list** con el siguiente body

```
{
	"bucket": "<nombre del bucket existente en el Object Storage>",
	"name": "<npmbre del file.txt del que queremos su contenido>"
}
```
