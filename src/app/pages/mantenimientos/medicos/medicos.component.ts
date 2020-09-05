import { Component, OnInit, OnDestroy } from '@angular/core';
import { MedicoService } from '../../../services/medico.service'
import { Medico } from 'src/app/models/medico.model';
import { ModalImagenService } from 'src/app/services/modal-imagen.service';
import { BusquedasService } from 'src/app/services/busquedas.service';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medicos',
  templateUrl: './medicos.component.html',
  styles: [
  ]
})
export class MedicosComponent implements OnInit, OnDestroy {

  constructor( private medicoService: MedicoService, private modalImagenService: ModalImagenService, private busquedasService: BusquedasService ) { }

  public cargando: boolean = true;
  public medicos: Medico[] = [];
  private imgSubs: Subscription;

  ngOnInit(): void {
    this.cargarMedicos();

    this.imgSubs = this.modalImagenService.nuevaImagen
    .pipe(
      delay(500)
    )
    .subscribe( img => this.cargarMedicos() );

  }

  ngOnDestroy(): void {
    this.imgSubs.unsubscribe();
  }

  cargarMedicos() {
    this.cargando = true;
    this.medicoService.cargarMedicos()
      .subscribe( resp =>{
        this.cargando = false;
        this.medicos = resp;
        console.log(resp);
      })
  }

  abrirModal( medico: Medico ) {
    this.modalImagenService.abrirModal( 'medicos' , medico._id, medico.img );
  }

  buscar( termino: string ) {

    if ( termino.length === 0 ) { 
      return this.cargarMedicos();
    }

    this.busquedasService.buscar( 'medicos', termino )
          .subscribe( resultados => {
            this.medicos = resultados;
          });
  }

  borrarMedico( medico: Medico ) {

    Swal.fire({
      title: '¿Borrar médico?',
      text: `Está a punto de borrar a ${ medico.nombre }`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.value) {
        
        this.medicoService.eliminarMedico( medico._id )
            .subscribe( resp => { 

              this.cargarMedicos();

              Swal.fire('Médico borrado', 
              `${ medico.nombre } fue eliminado correctamente`,
              'success'
              ) 
            });
      }
    })

  }

}
