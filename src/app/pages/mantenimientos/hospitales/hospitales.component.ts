import { Component, OnInit, OnDestroy } from '@angular/core';
import { HospitalService } from '../../../services/hospital.service';
import { ModalImagenService } from 'src/app/services/modal-imagen.service';
import { Hospital } from 'src/app/models/hospital.model';
import Swal from 'sweetalert2';
import { delay } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { BusquedasService } from 'src/app/services/busquedas.service';

@Component({
  selector: 'app-hospitales',
  templateUrl: './hospitales.component.html',
  styles: [
  ]
})
export class HospitalesComponent implements OnInit, OnDestroy {

  public hospitales: Hospital[] = [];
  public cargando: boolean = true;
  public hospitalesTemp: Hospital[] = [];
  private imgSubs: Subscription;

  constructor( private hospitalService: HospitalService, private modalImagenService: ModalImagenService,  private busquedasService: BusquedasService ) { }

  ngOnInit(): void {

    this.cargarHospitales();

    this.imgSubs = this.modalImagenService.nuevaImagen
    .pipe(
      delay(500)
    )
    .subscribe( img => this.cargarHospitales() );
  

  }

  ngOnDestroy(): void {
    this.imgSubs.unsubscribe();
  }

  cargarHospitales() {
    this.cargando = true;
    this.hospitalService.cargarHospitales().subscribe( 
      resp=>{
      this.hospitales = resp;
      this.cargando = false;
    })

  }

  guardarCambios( hospital: Hospital ) {
    this.hospitalService.actualizarHospital( hospital._id, hospital.nombre )
      .subscribe( resp=> {
        Swal.fire( 'Actualizado', hospital.nombre, 'success' );
      })
  }

  eliminarHospital( hospital: Hospital ) {
    this.hospitalService.eliminarHospital( hospital._id )
      .subscribe( resp=> {
        this.cargarHospitales();
        Swal.fire( 'Eliminado', hospital.nombre, 'success' );
      })
  }

  async abrirSweetAlert() {
    const { value = '' } = await Swal.fire<string>({
      title: 'Crear hospital',
      text: 'Ingrese el nombre del nuevo hospital',
      input: 'text',
      showCancelButton: true,
      inputPlaceholder: 'Nombre del Hospital'
    })

    if ( value.trim().length > 0 ) {
        this.hospitalService.crearHospital( value )
          .subscribe( (resp: any)=> {
            this.hospitales.push( resp.hospital )
          })
    }

  }

  abrirModal( hospital: Hospital ) {
    this.modalImagenService.abrirModal( 'hospitales' , hospital._id, hospital.img );
  }

  buscar( termino: string ) {

    if ( termino.length === 0 ) { 
      return this.cargarHospitales();
    }

    this.busquedasService.buscar( 'hospitales', termino )
          .subscribe( resultados => {
            this.hospitales = resultados;
          });
  }

}
