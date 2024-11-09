import React, { useState } from 'react';
import { Briefcase, Book, Award, Globe, Mail, Linkedin, ChevronRight, Code, Terminal, Cpu } from 'lucide-react';

const Portfolio = () => {
  const [activeTab, setActiveTab] = useState('experience');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header Section */}
      <header className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Guillermo Badia Marti</h1>
              <p className="text-lg text-gray-600 mt-2">Director de Proyectos y Procesos | Transformación Digital</p>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="mailto:guillermo.badia@gmail.com" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                <Mail size={20} />
                <span>Contacto</span>
              </a>
              <a href="https://www.linkedin.com/in/guillermobadia" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                <Linkedin size={20} />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Liderando la Transformación Digital</h2>
              <p className="text-xl text-gray-600 mb-6">
                Experto en dirección de proyectos tecnológicos complejos con un historial probado
                de éxito en la implementación de soluciones que generan ROI medible.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Globe size={20} />
                  <span>Valencia, España</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Briefcase size={20} />
                  <span>15+ años de experiencia</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <Terminal className="text-blue-600 mb-2" size={24} />
                <h3 className="font-semibold text-gray-800 mb-2">Desarrollo Técnico</h3>
                <p className="text-gray-600">JD Edwards, ERPs, Sistemas Empresariales</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <Code className="text-green-600 mb-2" size={24} />
                <h3 className="font-semibold text-gray-800 mb-2">Gestión de Proyectos</h3>
                <p className="text-gray-600">PRINCE2, PMI, ITIL</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <Cpu className="text-purple-600 mb-2" size={24} />
                <h3 className="font-semibold text-gray-800 mb-2">Transformación Digital</h3>
                <p className="text-gray-600">Optimización de Procesos</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <Award className="text-orange-600 mb-2" size={24} />
                <h3 className="font-semibold text-gray-800 mb-2">Liderazgo</h3>
                <p className="text-gray-600">Equipos Multidisciplinarios</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('experience')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'experience'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Experiencia
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'skills'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Habilidades
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'education'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Educación
          </button>
        </div>

        {/* Content Sections */}
        {activeTab === 'experience' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Director de Proyectos y Procesos</h3>
                  <p className="text-gray-600">Grupo G's España</p>
                  <p className="text-gray-500 text-sm">2020 - Presente</p>
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Dirección de proyectos de transformación digital
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Implementación de sistemas de medición de productividad
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Gestión de equipos multidisciplinarios
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Technical Consultant of JD Edwards</h3>
                  <p className="text-gray-600">Qualita Solutions & Consulting</p>
                  <p className="text-gray-500 text-sm">2011 - 2016</p>
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Desarrollo e implementación de soluciones JD Edwards
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Instructor de herramientas de desarrollo
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Gestión de proyectos internacionales
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Habilidades Técnicas</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">JD Edwards</span>
                    <span className="text-gray-600">95%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '95%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">Gestión de Proyectos</span>
                    <span className="text-gray-600">90%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '90%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">Transformación Digital</span>
                    <span className="text-gray-600">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Certificaciones</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Award className="text-blue-600" size={20} />
                  <span className="text-gray-700">PRINCE2 Foundation Certificate</span>
                </li>
                <li className="flex items-center gap-3">
                  <Award className="text-blue-600" size={20} />
                  <span className="text-gray-700">Microsoft Dynamics Nav</span>
                </li>
                <li className="flex items-center gap-3">
                  <Award className="text-blue-600" size={20} />
                  <span className="text-gray-700">ITIL</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'education' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start gap-4">
                <Book className="text-blue-600" size={24} />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Grado en Ingeniería Informática</h3>
                  <p className="text-gray-600">Universidad Europea</p>
                  <p className="text-gray-500 mt-2">
                    Especialización en desarrollo de software y sistemas empresariales
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start gap-4">
                <Book className="text-blue-600" size={24} />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">ITIG, Informática de Gestión</h3>
                  <p className="text-gray-600">Universitat Jaume I</p>
                  <p className="text-gray-500 mt-2">
                    Fundamentos de gestión empresarial y sistemas informáticos
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Guillermo Badia Marti</h3>
              <p className="text-gray-400">Transformando empresas a través de la tecnología</p>
            </div>
            <div className="flex gap-4">
              <a href="mailto:guillermo.badia@gmail.com" className="hover:text-blue-400">
                <Mail size={24} />
              </a>
              <a href="https://www.linkedin.com/in/guillermobadia" className="hover:text-blue-400">
                <Linkedin size={24} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;
