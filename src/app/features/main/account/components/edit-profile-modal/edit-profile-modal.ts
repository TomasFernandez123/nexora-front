import { Component, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from '../../../../../shared/components/modal/modal';
import { User } from '../../../../auth/services/auth';
import { ageRangeValidator } from '../../../../../shared/forms-validators';
import { FormUtils } from '../../../../../shared/utils/forms-utils';

export interface EditProfileData {
  name?: string;
  lastName?: string;
  email?: string;
  username?: string;
  description?: string;
  date?: string;
}

@Component({
  selector: 'app-edit-profile-modal',
  imports: [Modal, ReactiveFormsModule],
  templateUrl: './edit-profile-modal.html',
  styleUrl: './edit-profile-modal.scss'
})
export class EditProfileModal implements OnInit {
  private fb = inject(FormBuilder);
  
  profile = input.required<User>();
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<EditProfileData>();
  
  formUtils = FormUtils;
  loading = signal(false);

  private initialValues: any = {};

  editProfileForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    description: ['', [Validators.required, Validators.maxLength(150)]],
    date: ['', [Validators.required, ageRangeValidator(13, 100)]],
  });

  ngOnInit() {
    const currentProfile = this.profile();
    if (currentProfile) {
      const dateValue = currentProfile.dateOfBirth 
        ? new Date(currentProfile.dateOfBirth).toISOString().split('T')[0] 
        : '';

      const formValues = {
        name: currentProfile.name,
        lastName: currentProfile.lastName,
        email: currentProfile.email,
        username: currentProfile.username,
        description: currentProfile.description,
        date: dateValue,
      };

      this.editProfileForm.patchValue(formValues);
      
      this.initialValues = { ...formValues };
    }
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (this.editProfileForm.invalid) {
      this.editProfileForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    
    const currentValues = this.editProfileForm.value;
    const changedData: EditProfileData = {};
    
    Object.keys(currentValues).forEach(key => {
      if (currentValues[key] !== this.initialValues[key]) {
        changedData[key as keyof EditProfileData] = currentValues[key];
      }
    });
    
    this.save.emit(changedData);
  }
}
