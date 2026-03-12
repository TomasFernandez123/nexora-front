import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthLayoutCard } from '../../components/auth-layout-card/auth-layout-card';
import { AuthHeader } from '../../components/auth-header/auth-header';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { Auth } from '../../services/auth';
import { Toast } from '../../../../core/services/toast';

@Component({
  selector: 'app-auth-callback',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AuthLayoutCard, AuthHeader, Spinner],
  templateUrl: './callback.html',
})
export class AuthCallback implements OnInit {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastSvc = inject(Toast);

  loading = signal(true);
  message = signal('Completing sign in...');

  ngOnInit(): void {
    const providerError = this.route.snapshot.queryParamMap.get('error');

    if (providerError) {
      this.handleFailure('The social login provider returned an error. Please try again.');
      return;
    }

    this.auth.completeOAuthAuthentication().subscribe((user) => {
      if (!user) {
        this.handleFailure('We could not validate your session after the provider redirect.');
        return;
      }

      sessionStorage.setItem('oauth-login', '1');
      this.toastSvc.success('Login successful', 'Redirected to your account.');
      this.router.navigateByUrl(user.role === 'admin' ? '/dashboard/users' : '/main/posts');
    });
  }

  private handleFailure(message: string) {
    this.loading.set(false);
    this.message.set(message);
    this.toastSvc.error('OAuth login failed', message);
    this.router.navigateByUrl('/login');
  }
}